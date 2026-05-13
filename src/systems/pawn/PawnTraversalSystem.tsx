import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePawnStore, pawnLogicalState } from '@/stores/usePawnStore';
import { movementEvents } from './movementEvents';
import { usePawnMotionStore } from './usePawnMotionStore';
import { generateVelocityProfile } from './velocityProfile';
const damp = (current: number, target: number, smoothing: number, dt: number) => {
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * dt));
};

const MOVE_DURATION = 0.22;
const SETTLE_DURATION = 0.05;
const TOTAL_STEP_DURATION = MOVE_DURATION + SETTLE_DURATION;

export function PawnTraversalSystem() {
  const { path, currentTileIndex, targetTileIndex, isMoving, stepsRemaining, initialize, onStepComplete } = usePawnStore();
  const setMovementState = usePawnMotionStore(state => state.setMovementState);

  // Initialize path on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Keep track of the current logical target position
  const targetPos = useRef(new THREE.Vector3());
  const hasInitializedPos = useRef(false);
  const stepTimer = useRef(0);
  const wasMoving = useRef(false);

  // Track isMoving changes for state machine transitions
  useEffect(() => {
    if (isMoving) {
      if (!wasMoving.current) {
        stepTimer.current = 0;
      }
      setMovementState('MOVING');
      movementEvents.emit('MOVEMENT_START');
      usePawnMotionStore.setState({ landingProgress: 0, settleProgress: 0 });
    } else {
      if (usePawnMotionStore.getState().movementState !== 'IDLE') {
        setMovementState('LANDING');
        movementEvents.emit('MOVEMENT_LANDING');
        usePawnMotionStore.setState({ landingProgress: 0 });
      }
    }
    wasMoving.current = isMoving;
  }, [isMoving, setMovementState]);

  useFrame((_, delta) => {
    if (path.length === 0) return;

    const targetNode = path[targetTileIndex];
    targetPos.current.set(...targetNode.position);
    pawnLogicalState.targetPosition.copy(targetPos.current);

    if (!hasInitializedPos.current) {
      pawnLogicalState.position.copy(targetPos.current);
      pawnLogicalState.direction = targetNode.direction;
      hasInitializedPos.current = true;
      return;
    }

    const motionStore = usePawnMotionStore.getState();
    const state = motionStore.movementState;

    // Timeline-based landing progression
    if (state === 'LANDING') {
      const p = Math.min(1, motionStore.landingProgress + delta * 4);
      usePawnMotionStore.setState({ landingProgress: p });
      if (p >= 1) {
        usePawnMotionStore.getState().setMovementState('SETTLING');
        movementEvents.emit('MOVEMENT_SETTLED');
        usePawnMotionStore.setState({ settleProgress: 0 });
      }
    } else if (state === 'SETTLING') {
      const p = Math.min(1, motionStore.settleProgress + delta * 3);
      usePawnMotionStore.setState({ settleProgress: p });
      // Transition to IDLE is handled by PawnMotionSystem when visually settled
    }

    if (isMoving) {
      // Time-based segmented traversal
      const startNode = path[currentTileIndex];
      const startPos = new THREE.Vector3(...startNode.position);
      
      const dir = new THREE.Vector3().subVectors(targetPos.current, startPos);
      const dist = dir.length();
      
      if (dist > 0) {
        dir.normalize();
        pawnLogicalState.movementVector.copy(dir); // Update real movement vector
      }

      pawnLogicalState.direction = targetNode.direction;

      stepTimer.current += delta;

      // Calculate progress
      const moveProgress = Math.min(1, stepTimer.current / MOVE_DURATION);
      
      // Soften acceleration curve and add micro-pacing for a natural cadence
      const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
      const easedProgress = easeInOutSine(moveProgress);

      // Interpolate position
      pawnLogicalState.position.copy(startPos).lerp(targetPos.current, easedProgress);

      const motionVelocity = generateVelocityProfile(easedProgress);
      usePawnMotionStore.setState({ movementProgress: moveProgress, motionVelocity });

      if (stepTimer.current >= TOTAL_STEP_DURATION) {
        stepTimer.current = 0; // Reset for next tile to avoid drift/skip buildup
        
        if (stepsRemaining > 1) {
          movementEvents.emit('MOVEMENT_TILE_STEP', { nodeId: targetNode.id, direction: targetNode.direction });
          if (targetNode.isCorner) {
            movementEvents.emit('MOVEMENT_CORNER', { nodeId: targetNode.id, direction: targetNode.direction });
          }
        }
        onStepComplete();
      }
    } else {
      // Cleanly snap to target or fast approach when not logically moving, though it should be already there
      pawnLogicalState.position.copy(targetPos.current);
      usePawnMotionStore.setState({ movementProgress: 0, motionVelocity: 0 });
    }
  });

  return null;
}
