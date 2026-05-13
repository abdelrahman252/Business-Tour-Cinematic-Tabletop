import { create } from 'zustand';
import { MovementState } from './movementEvents';

export interface PawnMotionStore {
  movementState: MovementState;
  movementProgress: number;
  landingProgress: number;
  settleProgress: number;
  motionVelocity: number;
  turnAmount: number;
  setMovementState: (state: MovementState) => void;
}

export const usePawnMotionStore = create<PawnMotionStore>((set) => ({
  movementState: 'IDLE',
  movementProgress: 0,
  landingProgress: 0,
  settleProgress: 0,
  motionVelocity: 0,
  turnAmount: 0,
  setMovementState: (state) => set({ movementState: state }),
}));
