import * as THREE from 'three';
import { useDiceStore } from './useDiceStore';

export const getDiceCameraTargets = (t: number) => {
  const eventState = useDiceStore.getState().eventState;
  const center = useDiceStore.getState().diceCenter;
  
  // Base configuration: Board is ALWAYS the hero shot.
  const pos = new THREE.Vector3(0, 3.5, 5.0);
  const look = new THREE.Vector3(0, 0.0, 0); 
  let fov = 35;
  let posDamping = 1.5;
  let rotDamping = 1.5;
  let driftAmpX = 0.08;
  let driftAmpY = 0.04;

  if (eventState === 'CAMERA_GLIDE_TO_RING' || eventState === 'ESTABLISHING_SHOT') {
    // ESTABLISHING SHOT: Stop before overshooting, maintain tabletop angle, wider context
    pos.set(0, 3.2, 5.5); // Reduced forward travel, anchor to ring center, preserve miniature-world scale
    look.set(0, 0, 0); // Anchored to actual ring center
    fov = 32;
    posDamping = 1.55;
    rotDamping = 1.65;
    driftAmpX = 0.05;
    driftAmpY = 0.025;
  } else if (eventState === 'CONTROLLED_ROLL' || eventState === 'RESULT_SETTLE') {
    // Frame the arena, with enough dice tracking to feel locked to the action.
    pos.set(center[0] * 0.1, 3.05, 5.25 + center[2] * 0.04);
    look.set(center[0] * 0.18, 0.12, center[2] * 0.14); 
    fov = 32;
    posDamping = 3.15;
    rotDamping = 3.35;
    driftAmpX = 0.025;
    driftAmpY = 0.012;
  } else if (eventState === 'RESULT_HOLD') {
    // Subtle dramatic hold
    pos.set(center[0] * 0.08, 2.72, 4.7);
    look.set(center[0] * 0.22, 0.1, center[2] * 0.18);
    fov = 30; // slightly pushed in for result
    posDamping = 2.7;
    rotDamping = 2.9;
    driftAmpX = 0.018;
    driftAmpY = 0.008;
  }

  // Very subtle cinematic drift to keep it alive
  const driftSpeed = 0.1;
  pos.x += Math.sin(t * driftSpeed) * driftAmpX;
  pos.y += Math.cos(t * driftSpeed * 0.8) * driftAmpY;

  return { pos, look, fov, posDamping, rotDamping };
};
