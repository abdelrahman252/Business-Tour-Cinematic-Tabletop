import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo, useEffect, useRef } from 'react';
import { cameraConfig } from '@/config/cameraConfig';
import { useCameraStore } from '@/stores/useCameraStore';
import { damp, dampVec3 } from './cameraBehaviors';
import { usePawnStore, pawnLogicalState } from '@/stores/usePawnStore';
import { usePawnMotionStore } from '@/systems/pawn/usePawnMotionStore';
import { movementEvents } from '@/systems/pawn/movementEvents';
import { CameraIntentSystem } from './cinematic/CameraIntentSystem';
import { useDiceStore } from '@/systems/dice/useDiceStore';
import { getDiceCameraTargets } from '@/systems/dice/DiceCameraRig';
import { useInteractionStore } from '@/stores/useInteractionStore';

export function CameraDirector() {
  const mode = useCameraStore((state) => state.mode);
  const storeTargetPos = useCameraStore((state) => state.targetPosition);
  const storeLookAt = useCameraStore((state) => state.lookAtTarget);

  // Internal states to lerp towards
  const currentLookAt = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const targetLookAtVec = useMemo(() => new THREE.Vector3(), []);
  const targetPosVec = useMemo(() => new THREE.Vector3(), []);
  const smoothedMovementVector = useMemo(() => new THREE.Vector3(0, 0, -1), []);
  
  const camBase = useMemo(() => new THREE.Vector3(...cameraConfig.basePosition), []);

  const fovBump = useRef(0);
  
  // Transition states
  const previousMode = useRef(mode);
  const blendFromMode = useRef<typeof mode>('BOARD');
  const followBlendProgress = useRef(1); // 1 = fully complete
  
  // Create Cinematic Director Intent System
  const intentSystem = useMemo(() => new CameraIntentSystem(), []);

  useEffect(() => {
    // Listen to landing event for micro-bounce effect
    const unsub1 = movementEvents.on('MOVEMENT_LANDING', () => {
      fovBump.current = -1.5; // Compress FOV slightly for impact
    });
    return () => {
      unsub1();
    };
  }, []);

  // eslint-disable-next-line react-hooks/immutability
  useFrame((state, delta) => {
    // ── INTERACTION MODE GUARD ─────────────────────────────────────────────
    // When INSPECT or DRAG mode is active, those controllers own the camera.
    const interactionMode = useInteractionStore.getState().mode;
    if (interactionMode !== null) return;

    const t = state.clock.getElapsedTime();
    const config = cameraConfig.modes[mode] || cameraConfig.modes['BOARD'];
    
    // Recover FOV bump
    fovBump.current = damp(fovBump.current, 0, 10, delta);
    
    // Check Intro/Return Handoff trigger
    if (mode !== previousMode.current) {
      if (mode === 'FOLLOW' && (previousMode.current === 'BOARD' || previousMode.current === 'DICE')) {
        followBlendProgress.current = 0; // Start cinematic blend
        blendFromMode.current = previousMode.current;
      } else {
        followBlendProgress.current = 1; // Snap for other transitions
      }
      previousMode.current = mode;
    }

    // Advance Cinematic Blend Handoff
    if (followBlendProgress.current < 1) {
      followBlendProgress.current += delta * 0.6; // ~1.6s duration for smoother handoffs
      if (followBlendProgress.current > 1) followBlendProgress.current = 1;
    }

    let currentPosDamping = config.damping;
    let currentRotDamping = config.damping;
    let targetFov = config.fov;

    const getBoardTargets = () => {
      const { xAmp1, xFreq1, xAmp2, xFreq2, yAmp, yFreq, zAmp, zFreq } = cameraConfig.idleDrift;
      const driftX = Math.sin(t * xFreq1) * xAmp1 + Math.sin(t * xFreq2) * xAmp2;
      const driftY = Math.sin(t * yFreq) * yAmp;
      const driftZ = Math.cos(t * zFreq) * zAmp;

      const pos = new THREE.Vector3(camBase.x + driftX, camBase.y + driftY, camBase.z + driftZ);
      
      const { xAmp: lx, xFreq: lxf, yAmp: ly, yFreq: lyf, zAmp: lz, zFreq: lzf } = cameraConfig.lookAtDrift;
      const lookDrift = new THREE.Vector3(Math.sin(t * lxf) * lx, Math.sin(t * lyf) * ly, Math.cos(t * lzf) * lz);
      
      const look = new THREE.Vector3(0, 0, 0).add(lookDrift);
      
      return { pos, look, fov: config.fov, posDamping: config.damping, rotDamping: config.damping };
    };

    const getFollowTargets = () => {
      const { path, currentTileIndex, targetTileIndex, isMoving } = usePawnStore.getState();
      const motionStore = usePawnMotionStore.getState();
      
      const currentNode = path[currentTileIndex] || null;
      const nextNode = path[targetTileIndex] || null;
      const futureNode = path.length > 0 ? path[(targetTileIndex + 1) % path.length] : null;

      const targetMovementVector = pawnLogicalState.movementVector.clone();
      if (targetMovementVector.lengthSq() < 0.001) {
         if (pawnLogicalState.direction === "UP") targetMovementVector.set(0, 0, -1);
         else if (pawnLogicalState.direction === "DOWN") targetMovementVector.set(0, 0, 1);
         else if (pawnLogicalState.direction === "LEFT") targetMovementVector.set(-1, 0, 0);
         else if (pawnLogicalState.direction === "RIGHT") targetMovementVector.set(1, 0, 0);
      }

      const { stepsRemaining } = usePawnStore.getState();

      // --- SUBTLE CORNER ANTICIPATION ---
      if (isMoving && nextNode && futureNode && stepsRemaining > 1) {
        const nextSegmentDir = new THREE.Vector3()
          .subVectors(new THREE.Vector3(...futureNode.position), new THREE.Vector3(...nextNode.position))
          .normalize();
        
        if (nextSegmentDir.lengthSq() > 0.5 && targetMovementVector.dot(nextSegmentDir) < 0.99) {
          const p = motionStore.movementProgress;
          // Shorter, later anticipation to avoid S-curve jitter
          if (p > 0.6) {
            const blend = (p - 0.6) / 0.4;
            const easeBlend = blend * blend * (3 - 2 * blend);
            // Blend only 40% into the turn to prevent overshoot
            const anticipation = new THREE.Vector3().copy(targetMovementVector).lerp(nextSegmentDir, 0.4).normalize();
            targetMovementVector.lerp(anticipation, easeBlend).normalize();
          }
        }
      }

      // Single source of rotational truth to prevent lookAt vs position fighting
      const turnDot = targetMovementVector.dot(smoothedMovementVector);
      const isTurningHard = turnDot < 0.98 && motionStore.motionVelocity > 0.05;
      
      // Heavy cinematic drag on rotation during turns to smooth directional transitions
      const rotSpeed = isTurningHard ? 3.5 : 8; 
      const smoothT = damp(0, 1, rotSpeed, delta); 
      smoothedMovementVector.lerp(targetMovementVector, smoothT).normalize();
      if (smoothedMovementVector.distanceToSquared(targetMovementVector) < 0.00001) {
        smoothedMovementVector.copy(targetMovementVector);
      }

      const isFinalApproach = (stepsRemaining <= 1 && isMoving && motionStore.movementProgress > 0.5) || !isMoving;

      const composition = intentSystem.update(
        currentNode,
        nextNode,
        futureNode,
        smoothedMovementVector,
        targetMovementVector,
        motionStore.motionVelocity,
        motionStore.movementProgress,
        isFinalApproach
      );

      const look = pawnLogicalState.position.clone().add(composition.lookAtOffset);
      const pos = pawnLogicalState.position.clone().add(composition.cameraPositionOffset);

      return { 
        pos, 
        look, 
        fov: composition.fov, 
        posDamping: composition.positionDamping, 
        rotDamping: composition.rotationDamping 
      };
    };

    const getDiceTargets = () => {
      return getDiceCameraTargets(t);
    };

    if (mode === 'BOARD' || (mode === 'FOLLOW' && followBlendProgress.current === 0)) {
      const b = getBoardTargets();
      targetPosVec.copy(b.pos);
      targetLookAtVec.copy(b.look);
      targetFov = b.fov;
      currentPosDamping = b.posDamping;
      currentRotDamping = b.rotDamping;
      
      // Keep smoothed vector aligned while in BOARD to prevent snap on transition
      smoothedMovementVector.set(0, 0, -1); 
    } else if (mode === 'FOLLOW') {
      const f = getFollowTargets();
      
      if (followBlendProgress.current < 1) {
        // CINEMATIC HANDOFF BLEND (From BOARD or DICE)
        const b = blendFromMode.current === 'DICE' ? getDiceTargets() : getBoardTargets();
        const p = followBlendProgress.current;
        // Cubic easing for premium feel
        const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        
        targetPosVec.lerpVectors(b.pos, f.pos, ease);
        targetLookAtVec.lerpVectors(b.look, f.look, ease);
        targetFov = THREE.MathUtils.lerp(b.fov, f.fov, ease);
        
        // Progressive damping ramp-in for soft attachment
        currentPosDamping = THREE.MathUtils.lerp(b.posDamping, f.posDamping, ease);
        currentRotDamping = THREE.MathUtils.lerp(b.rotDamping, f.rotDamping, ease);
      } else {
        targetPosVec.copy(f.pos);
        targetLookAtVec.copy(f.look);
        targetFov = f.fov;
        currentPosDamping = f.posDamping;
        currentRotDamping = f.rotDamping;
      }
    } else if (mode === 'DICE') {
      const d = getDiceTargets();
      targetPosVec.copy(d.pos);
      targetLookAtVec.copy(d.look);
      targetFov = d.fov;
      currentPosDamping = d.posDamping;
      currentRotDamping = d.rotDamping;
    } else {
       targetLookAtVec.set(...storeLookAt);
       targetPosVec.set(...storeTargetPos);
    }

    // HARD CINEMATIC CONSTRAINTS
    // 1. Vertical Clamps: Prevent sky framing & overhead floating
    // eslint-disable-next-line react-hooks/immutability
    targetPosVec.y = THREE.MathUtils.clamp(targetPosVec.y, 0.8, 12.0);
    
    // 2. Board Anchoring: Prevent camera from looking off into empty space
    // eslint-disable-next-line react-hooks/immutability
    targetLookAtVec.x = THREE.MathUtils.clamp(targetLookAtVec.x, -3.5, 3.5);
    targetLookAtVec.y = THREE.MathUtils.clamp(targetLookAtVec.y, -0.5, 1.5);
    targetLookAtVec.z = THREE.MathUtils.clamp(targetLookAtVec.z, -3.5, 3.5);

    // Lerp FOV
    if (state.camera instanceof THREE.PerspectiveCamera) {
      state.camera.fov = damp(state.camera.fov, targetFov + fovBump.current, config.damping, delta);
      state.camera.updateProjectionMatrix();
    }

    // Apply damping
    dampVec3(state.camera.position, targetPosVec, currentPosDamping, delta);
    dampVec3(currentLookAt, targetLookAtVec, currentRotDamping, delta);
    
    state.camera.lookAt(currentLookAt);
  });

  return null;
}

