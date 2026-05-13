import { create } from 'zustand';
import * as THREE from 'three';
import { BoardNode, createBoardPath } from '@/systems/board/createBoardPath';

export const pawnLogicalState = {
  position: new THREE.Vector3(),
  direction: 'UP' as "UP" | "DOWN" | "LEFT" | "RIGHT",
  movementVector: new THREE.Vector3(0, 0, -1),
  targetPosition: new THREE.Vector3(),
};

export interface PawnStore {
  path: BoardNode[];
  currentTileIndex: number;
  targetTileIndex: number;
  isMoving: boolean;
  stepsRemaining: number;
  
  initialize: () => void;
  moveBySteps: (stepCount: number) => void;
  onStepComplete: () => void;
  onMovementComplete: () => void;
}

export const usePawnStore = create<PawnStore>((set, get) => ({
  path: [],
  currentTileIndex: 0,
  targetTileIndex: 0,
  isMoving: false,
  stepsRemaining: 0,

  initialize: () => {
    const path = createBoardPath();
    set({
      path,
      currentTileIndex: 0,
      targetTileIndex: 0,
      isMoving: false,
      stepsRemaining: 0,
    });
  },

  moveBySteps: (stepCount: number) => {
    const { path, currentTileIndex, isMoving, stepsRemaining } = get();
    if (path.length === 0) return;

    // If already moving, queue it up (by adding to stepsRemaining)
    // or just overwrite. For queued movement, we add.
    const newStepsRemaining = isMoving ? stepsRemaining + stepCount : stepCount;
    
    // The next immediate target tile
    const nextTargetIndex = (currentTileIndex + 1) % path.length;

    set({
      stepsRemaining: newStepsRemaining,
      isMoving: true,
      // If we weren't moving, we need to set the target to the next tile
      targetTileIndex: isMoving ? get().targetTileIndex : nextTargetIndex,
    });
  },

  onStepComplete: () => {
    const { path, targetTileIndex, stepsRemaining } = get();
    
    // We just arrived at targetTileIndex
    const newCurrentIndex = targetTileIndex;
    const newStepsRemaining = Math.max(0, stepsRemaining - 1);
    
    if (newStepsRemaining > 0) {
      // Continue moving to the next tile
      const nextTargetIndex = (newCurrentIndex + 1) % path.length;
      set({
        currentTileIndex: newCurrentIndex,
        targetTileIndex: nextTargetIndex,
        stepsRemaining: newStepsRemaining,
      });
    } else {
      // Finished moving
      set({
        currentTileIndex: newCurrentIndex,
        targetTileIndex: newCurrentIndex,
        stepsRemaining: 0,
        isMoving: false,
      });
    }
  },

  onMovementComplete: () => {
    set({ isMoving: false, stepsRemaining: 0 });
  }
}));
