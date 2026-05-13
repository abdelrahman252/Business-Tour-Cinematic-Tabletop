import React, { Suspense, useEffect } from 'react';
import { Physics } from '@react-three/rapier';
import { ContactShadows } from '@react-three/drei';
import { DiceArena } from './DiceArena';
import { DicePhysicsController } from './DicePhysicsController';
import { useDiceStore } from './useDiceStore';
import { useCameraStore } from '@/stores/useCameraStore';

const DICE_CONTACT_SHADOW_Y = 0.388;

class DiceCinematicSequence {
  private timeouts: NodeJS.Timeout[] = [];

  private clearTimeouts() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }

  private schedule(fn: () => void, delay: number) {
    const t = setTimeout(fn, delay);
    this.timeouts.push(t);
  }

  public triggerSequence() {
    if (useDiceStore.getState().eventState !== 'GAMEPLAY_IDLE') return;

    this.clearTimeouts();

    const diceStore = useDiceStore.getState();
    const cameraStore = useCameraStore.getState();

    // 1. CAMERA_GLIDE_TO_RING: Smoothly glide toward center board
    diceStore.setEventState('CAMERA_GLIDE_TO_RING');
    cameraStore.setMode('DICE');

    this.schedule(() => {
      // 2. ESTABLISHING_SHOT: Stop before overshooting, let player acquire target
      diceStore.setEventState('ESTABLISHING_SHOT');
      
      this.schedule(() => {
        // 3. PHYSICAL THROW: Spawn dice high and apply momentum
        diceStore.setEventState('CONTROLLED_ROLL');
      }, 600); // 0.6s hold to clearly anticipate the throw
    }, 800); // 0.8s glide to center ring
  }
}

export const diceCinematicSequence = new DiceCinematicSequence();

export function DiceCinematicController() {
  const eventState = useDiceStore(state => state.eventState);

  // We mount the physics context only when active to avoid stray calculations 
  // and properly reset Rapier state each time.
  const isActive = eventState !== 'GAMEPLAY_IDLE';

  useEffect(() => {
    // Keep spacebar trigger for testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        diceCinematicSequence.triggerSequence();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Suspense fallback={null}>
      {isActive && (
        <>
          <ContactShadows
            position={[0, DICE_CONTACT_SHADOW_Y, 0]}
            scale={3.6}
            blur={1.45}
            opacity={0.46}
            far={1.1}
            resolution={1024}
            color="#070402"
          />
          <Physics
            gravity={[0, -34, 0]}
            numSolverIterations={8}
            numInternalPgsIterations={2}
            maxCcdSubsteps={3}
          >
            <DiceArena />
            <DicePhysicsController />
          </Physics>
        </>
      )}
    </Suspense>
  );
}
