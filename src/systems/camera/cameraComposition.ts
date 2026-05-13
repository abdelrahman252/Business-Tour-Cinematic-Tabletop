import * as THREE from 'three';
import { pawnLogicalState } from '@/stores/usePawnStore';
import { usePawnStore } from '@/stores/usePawnStore';
import { usePawnMotionStore } from '@/systems/pawn/usePawnMotionStore';

export function getDynamicFollowComposition(t: number): { positionOffset: THREE.Vector3, lookAtOffset: THREE.Vector3 } {
  const dir = pawnLogicalState.direction;
  const motionStore = usePawnMotionStore.getState();
  const velocity = motionStore.motionVelocity;

  // Velocity-aware framing
  const baseDistance = 6.0 + (velocity * 1.8); // Pull back when moving faster
  const height = 4.5 + (velocity * 0.5);       // Lift slightly when moving faster
  
  const positionOffset = new THREE.Vector3(0, height, baseDistance);
  const lookAtOffset = new THREE.Vector3(0, 0, 0);

  // Dynamic shoulder offset scaling
  const swing = 2.0 + (velocity * 1.2);
  const anticipationSwing = 1.5 + (velocity * 0.8);

  const { path, targetTileIndex, isMoving } = usePawnStore.getState();
  
  if (path.length > 0) {
    const targetNode = path[targetTileIndex];
    const futureIndex = (targetTileIndex + 1) % path.length;
    const futureNode = path[futureIndex];

    if (isMoving) {
      // Look slightly ahead towards future node (directional composition bias)
      const aheadVec = new THREE.Vector3(...futureNode.position).sub(new THREE.Vector3(...targetNode.position)).normalize();
      lookAtOffset.add(aheadVec.multiplyScalar(anticipationSwing));
    }
  }

  // Directional composition bias with wide shoulder framing
  if (dir === 'UP') {
    positionOffset.set(swing, height, baseDistance);
  } else if (dir === 'DOWN') {
    positionOffset.set(-swing, height, -baseDistance);
  } else if (dir === 'LEFT') {
    positionOffset.set(baseDistance, height, -swing);
  } else if (dir === 'RIGHT') {
    positionOffset.set(-baseDistance, height, swing);
  }

  // Subtle camera drift during traversal to feel more alive/cinematic
  if (isMoving) {
    positionOffset.x += Math.sin(t * 2.0) * 0.15;
    positionOffset.y += Math.cos(t * 1.8) * 0.1;
    positionOffset.z += Math.sin(t * 2.2) * 0.15;
  } else {
    // Idle breathing room
    positionOffset.y += Math.sin(t * 1.5) * 0.2;
    lookAtOffset.y += Math.sin(t * 1.0) * 0.05;
  }

  return { positionOffset, lookAtOffset };
}
