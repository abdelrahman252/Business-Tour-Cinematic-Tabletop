import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Pawn } from '@/components/pawn/Pawn';
import { pawnLogicalState } from '@/stores/usePawnStore';
import { usePawnMotionStore } from './usePawnMotionStore';
import { defaultMotionProfile } from './movementProfiles';

const damp = (current: number, target: number, smoothing: number, dt: number) => {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * dt));
};

export function PawnMotionSystem() {
  const pawnRef = useRef<THREE.Group>(null);
  
  // Smoothing values
  const currentRot = useRef(new THREE.Quaternion());
  const targetRot = useRef(new THREE.Quaternion());
  
  // Blended weights
  const weights = useRef({ moving: 0, landing: 0, settling: 0 });
  const offsets = useRef({ y: 0, scaleX: 1, scaleY: 1, scaleZ: 1 });

  useFrame((state, delta) => {
    if (!pawnRef.current) return;

    const motionStore = usePawnMotionStore.getState();
    const movementState = motionStore.movementState;
    const logicalPos = pawnLogicalState.position;

    // 1. Blend Weights
    if (movementState === 'IDLE') {
      weights.current.moving = 0;
      weights.current.landing = 0;
      weights.current.settling = 0;
      offsets.current.y = 0;
      offsets.current.scaleX = 1.0;
      offsets.current.scaleY = 1.0;
      offsets.current.scaleZ = 1.0;
    } else {
      const targetMoving = (movementState === 'MOVING' || movementState === 'STARTING' || movementState === 'TURNING') ? 1 : 0;
      const targetLanding = movementState === 'LANDING' ? 1 : 0;
      const targetSettling = movementState === 'SETTLING' ? 1 : 0;

      // Smooth weight transitions
      weights.current.moving = damp(weights.current.moving, targetMoving, 15, delta);
      weights.current.landing = damp(weights.current.landing, targetLanding, 15, delta);
      weights.current.settling = damp(weights.current.settling, targetSettling, 15, delta);
    }

    // 2. Compute motion effects for each state
    // Moving effect
    const bobProg = motionStore.movementProgress;
    const velocity = motionStore.motionVelocity;
    // Single clean arc per tile instead of running/bouncing
    const movingY = Math.sin(bobProg * Math.PI) * defaultMotionProfile.bobAmplitude * velocity;
    const movingScaleY = 1.0 + (0.05 * velocity);
    const movingScaleXZ = 1.0 - (0.05 * velocity);

    // Landing effect
    const p = motionStore.landingProgress;
    const squash = Math.sin(p * Math.PI);
    const landingY = -squash * defaultMotionProfile.landingCompression;
    const landingScaleY = 1.0 - (0.3 * squash);
    const landingScaleXZ = 1.0 + (0.2 * squash);

    // Settling effect
    const settlingY = 0;
    const settlingScale = 1.0;

    // Blend effects
    const wMoving = weights.current.moving;
    const wLanding = weights.current.landing;
    const wSettling = weights.current.settling;
    
    // Motion Composition Hierarchy
    // 1. Base Position (logicalPos)
    let currentYOffset = 0;
    
    // 2. Traversal Motion
    const traversalOffset = movingY * wMoving;
    currentYOffset += traversalOffset;
    
    // 3. Landing Layer
    const impactOffset = landingY * wLanding;
    currentYOffset += impactOffset;
    
    // 4. Settle Layer
    const residualOffset = settlingY * wSettling;
    currentYOffset += residualOffset;

    let scaleX = 1.0;
    scaleX = THREE.MathUtils.lerp(scaleX, movingScaleXZ, wMoving);
    scaleX = THREE.MathUtils.lerp(scaleX, landingScaleXZ, wLanding);
    scaleX = THREE.MathUtils.lerp(scaleX, settlingScale, wSettling);

    let scaleY = 1.0;
    scaleY = THREE.MathUtils.lerp(scaleY, movingScaleY, wMoving);
    scaleY = THREE.MathUtils.lerp(scaleY, landingScaleY, wLanding);
    scaleY = THREE.MathUtils.lerp(scaleY, settlingScale, wSettling);

    let scaleZ = scaleX; // Keep X and Z symmetrical for pawn

    if (movementState === 'IDLE') {
      // Hard clamp to zero to prevent microscopic float/scale breathing
      offsets.current.y = 0;
      offsets.current.scaleX = 1.0;
      offsets.current.scaleY = 1.0;
      offsets.current.scaleZ = 1.0;
    } else {
      // Smooth transition out to zero offsets over time
      offsets.current.y = damp(offsets.current.y, currentYOffset, 20, delta);
      offsets.current.scaleX = damp(offsets.current.scaleX, scaleX, 20, delta);
      offsets.current.scaleY = damp(offsets.current.scaleY, scaleY, 20, delta);
      offsets.current.scaleZ = damp(offsets.current.scaleZ, scaleZ, 20, delta);
    }

    // Stable Rest Pose Enforcement & Motion Reset Gate
    if (movementState === 'SETTLING') {
      const isSettled = 
        Math.abs(offsets.current.y) < 0.001 &&
        Math.abs(offsets.current.scaleX - 1.0) < 0.001 &&
        Math.abs(offsets.current.scaleY - 1.0) < 0.001 &&
        Math.abs(offsets.current.scaleZ - 1.0) < 0.001;

      if (isSettled) {
        usePawnMotionStore.setState({ movementState: 'IDLE' });
      }
    }

    // Temporary Debug Instrumentation (Uncomment to verify)
    // if (movementState !== 'IDLE') {
    //   console.log(`baseY: ${logicalPos.y.toFixed(3)}, bob: ${traversalOffset.toFixed(3)}, land: ${impactOffset.toFixed(3)}, settle: ${residualOffset.toFixed(3)}, finalY: ${(logicalPos.y + offsets.current.y).toFixed(3)}`);
    // }

    // 5. Final Safety Layer
    const finalComputedY = logicalPos.y + offsets.current.y;
    const finalY = Math.max(logicalPos.y, finalComputedY);
    
    pawnRef.current.position.set(logicalPos.x, finalY, logicalPos.z);
    pawnRef.current.scale.set(offsets.current.scaleX, offsets.current.scaleY, offsets.current.scaleZ);

    // 4. Compute facing rotation based on real movement vector
    const mv = pawnLogicalState.movementVector;
    if (mv.lengthSq() > 0.001) {
      // Derive angle from movement vector direction
      const angle = Math.atan2(mv.x, mv.z);
      targetRot.current.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    }

    // Slerp rotation or hard clamp if idle
    if (movementState === 'IDLE') {
      currentRot.current.copy(targetRot.current);
    } else {
      currentRot.current.slerp(targetRot.current, damp(0, 1, defaultMotionProfile.turnResponsiveness, delta));
    }
    pawnRef.current.quaternion.copy(currentRot.current);
  });

  return <Pawn ref={pawnRef} />;
}
