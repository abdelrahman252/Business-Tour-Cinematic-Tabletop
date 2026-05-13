import { create } from 'zustand';

export type DiceEventState = 
  | 'GAMEPLAY_IDLE' 
  | 'CAMERA_GLIDE_TO_RING' 
  | 'ESTABLISHING_SHOT' 
  | 'DICE_VISIBLE_IDLE' 
  | 'CONTROLLED_ROLL' 
  | 'RESULT_SETTLE' 
  | 'RESULT_HOLD' 
  | 'FOLLOW_RETURN';

export interface DiceStore {
  eventState: DiceEventState;
  diceValues: [number, number];
  diceCenter: [number, number, number];

  setEventState: (state: DiceEventState) => void;
  setDiceValues: (values: [number, number]) => void;
  setDiceCenter: (center: [number, number, number]) => void;
}

export const useDiceStore = create<DiceStore>((set) => ({
  eventState: 'GAMEPLAY_IDLE',
  diceValues: [1, 1],
  diceCenter: [0, 0, 0], // Center of board by default

  setEventState: (state) => set({ eventState: state }),
  setDiceValues: (values) => set({ diceValues: values }),
  setDiceCenter: (center) => set({ diceCenter: center }),
}));
