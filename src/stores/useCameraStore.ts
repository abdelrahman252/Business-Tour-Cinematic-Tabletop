import { create } from 'zustand';

export type CameraMode =
  | 'BOARD'
  | 'FOLLOW'
  | 'EVENT'
  | 'DICE'
  | 'OVERVIEW';

interface CameraStore {
  mode: CameraMode;
  targetPosition: [number, number, number];
  lookAtTarget: [number, number, number];
  activeTargetId: string | null;
  isTransitioning: boolean;

  setMode: (mode: CameraMode) => void;
  setTargetPosition: (position: [number, number, number]) => void;
  setLookAtTarget: (target: [number, number, number]) => void;
  setActiveTargetId: (id: string | null) => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  mode: 'BOARD',
  targetPosition: [7.5, 9, 9.5],
  lookAtTarget: [0, 0, 0],
  activeTargetId: null,
  isTransitioning: false,

  setMode: (mode) => set({ mode }),
  setTargetPosition: (position) => set({ targetPosition: position }),
  setLookAtTarget: (target) => set({ lookAtTarget: target }),
  setActiveTargetId: (id) => set({ activeTargetId: id }),
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
