import { create } from 'zustand';

interface GameState {
  turn: number;
  phase: 'setup' | 'playing' | 'end';
  nextTurn: () => void;
  setPhase: (phase: 'setup' | 'playing' | 'end') => void;
}

export const useGameStore = create<GameState>((set) => ({
  turn: 1,
  phase: 'setup',
  nextTurn: () => set((state) => ({ turn: state.turn + 1 })),
  setPhase: (phase) => set({ phase }),
}));
