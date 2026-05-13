import * as THREE from 'three';
import { BoardNode } from '@/systems/board/createBoardPath';
import { cameraConfig } from '@/config/cameraConfig';

export interface CameraAnticipation {
  lookAtOffset: THREE.Vector3;
  positionOffset: THREE.Vector3;
  framingIntensity: number;
}

export function calculatePathPrediction(
  currentNode: BoardNode,
  nextNode: BoardNode,
  futureNode: BoardNode,
  movementVector: THREE.Vector3,
  progress: number,
  normalizedVelocity: number
): CameraAnticipation {
  const lookAtOffset = new THREE.Vector3();
  const positionOffset = new THREE.Vector3();
  let intensity = 0;

  if (!currentNode || !nextNode || !futureNode) {
    return { lookAtOffset, positionOffset, framingIntensity: 0 };
  }

  // Detect if the next movement involves a corner
  if (nextNode.direction !== futureNode.direction) {
    const dirMap: Record<string, THREE.Vector3> = {
      "UP": new THREE.Vector3(0, 0, -1),
      "DOWN": new THREE.Vector3(0, 0, 1),
      "LEFT": new THREE.Vector3(-1, 0, 0),
      "RIGHT": new THREE.Vector3(1, 0, 0)
    };

    const currentDir = dirMap[nextNode.direction] || movementVector.clone().normalize();
    const futureDir = dirMap[futureNode.direction];
    
    if (futureDir && currentDir) {
      // Calculate turn severity
      const dot = currentDir.dot(futureDir);
      const turnAngle = Math.acos(THREE.MathUtils.clamp(dot, -1, 1));
      let turnSeverity = 1.0;
      
      // Turn Categories
      if (turnAngle < Math.PI / 4) {
        turnSeverity = 0.5; // Small Turn: subtle framing shift
      } else if (turnAngle <= Math.PI / 2 + 0.1) {
        turnSeverity = 1.0; // Hard 90° Turn: stronger composition lead
      } else {
        turnSeverity = 1.2; // Very hard turn
      }

      // Calculate distance to corner (using remaining progress on current tile)
      // distanceToCorner goes from 1.0 to 0.0 as we approach the corner
      const distanceToCorner = 1.0 - progress;
      const { anticipationDistance, anticipationStrength } = cameraConfig.anticipation;
      
      // Before reaching a corner: begin shifting camera composition early
      if (distanceToCorner < anticipationDistance) {
        // Normalize anticipation factor (0 at threshold, 1 at corner)
        const anticipationFactor = Math.max(0, 1.0 - (distanceToCorner / anticipationDistance));
        
        // Intensity scales with anticipation factor, velocity, turn severity, and strength
        intensity = Math.pow(anticipationFactor, 2) * Math.max(0.2, normalizedVelocity) * turnSeverity * anticipationStrength;
        
        // Look-at point anticipates the corner heavily to gently rotate framing direction
        lookAtOffset.copy(futureDir).multiplyScalar(4.0 * intensity);
        
        // Camera position anticipates turn to prepare framing
        // Harder turns widen the shoulder framing more
        const shoulderWidth = 2.0 + (turnSeverity * 1.5);
        positionOffset.copy(futureDir).multiplyScalar(shoulderWidth * intensity);

        // Widen framing slightly during turn approach by pulling back against movement vector
        if (movementVector.lengthSq() > 0.001) {
          positionOffset.addScaledVector(movementVector, -1.5 * intensity);
        }
      }
    }
  }

  return {
    lookAtOffset,
    positionOffset,
    framingIntensity: intensity
  };
}
