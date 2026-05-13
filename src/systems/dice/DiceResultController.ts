import { useDiceStore } from './useDiceStore';
import { useCameraStore } from '@/stores/useCameraStore';
import { usePawnStore } from '@/stores/usePawnStore';

class DiceResultController {
  private timeouts: NodeJS.Timeout[] = [];

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private schedule(fn: () => void, delay: number) {
    const t = setTimeout(fn, delay);
    this.timeouts.push(t);
  }

  public onDiceSettled(value1: number, value2: number) {
    const diceStore = useDiceStore.getState();
    if (diceStore.eventState !== 'RESULT_SETTLE') return;

    this.clearTimeouts();
    
    // RESULT_HOLD: Dramatic pause, top face readable, suspense moment created
    diceStore.setEventState('RESULT_HOLD');
    diceStore.setDiceValues([value1, value2]);

    const total = value1 + value2;

    this.schedule(() => {
      // FOLLOW_RETURN: Smoothly blend back to gameplay FOLLOW mode
      diceStore.setEventState('FOLLOW_RETURN');
      const cameraStore = useCameraStore.getState();
      cameraStore.setMode('FOLLOW');

      this.schedule(() => {
        // Return pawn to active gameplay gracefully
        usePawnStore.getState().moveBySteps(total);
        diceStore.setEventState('GAMEPLAY_IDLE');
      }, 1500); // 1.5s for follow return blend
    }, 2000); // 2 second dramatic result hold
  }
}

export const diceResultController = new DiceResultController();
