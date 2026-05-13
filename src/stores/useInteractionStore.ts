'use client';
/**
 * useInteractionStore
 *
 * Single source of truth for user-driven camera interaction modes.
 * Completely separate from the cinematic CameraDirector modes (BOARD, FOLLOW, DICE, etc).
 *
 * INSPECT  → custom polar-orbit controller (InspectController)
 * DRAG     → MapControls panning controller
 * (absent) → CameraDirector owns the camera
 */

import { create } from 'zustand';

export type InteractionMode = 'INSPECT' | 'DRAG' | null;

interface InteractionStore {
  mode: InteractionMode;
  setMode: (mode: InteractionMode) => void;
  toggleMode: (mode: InteractionMode) => void;
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  mode: null,

  setMode: (mode) => set({ mode }),

  toggleMode: (mode) => {
    const current = get().mode;
    set({ mode: current === mode ? null : mode });
  },
}));
