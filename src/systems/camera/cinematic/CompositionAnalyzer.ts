import * as THREE from 'three';
import { BoardNode } from '@/systems/board/createBoardPath';

export type CompositionSide = "LEFT" | "RIGHT" | "CENTER";

export class CompositionAnalyzer {
  public static determineOptimalSide(
    currentNode: BoardNode | null,
    movementDir: THREE.Vector3
  ): CompositionSide {
    if (!currentNode) return "CENTER";

    // In a monopoly-style board, we generally want the camera to be "outside" looking in
    // or "inside" looking out depending on the board structure.
    // For now, let's use the movement direction to bias the shoulder to the "open" side.
    
    // If moving RIGHT (1, 0, 0), the inside of the board is UP (0, 0, -1). 
    // We want the camera to sit slightly on the outside shoulder so we don't block the board center.
    // Let's compute a cross product with UP to find the "right" side of the character.
    
    const upVector = new THREE.Vector3(0, 1, 0);
    const rightSide = new THREE.Vector3().crossVectors(movementDir, upVector).normalize();
    
    // For a standard clockwise loop around a board center at (0,0,0)
    // The "outside" is the direction away from center.
    const toCenter = new THREE.Vector3(0, 0, 0).sub(new THREE.Vector3(currentNode.position[0], 0, currentNode.position[2])).normalize();
    
    const dot = rightSide.dot(toCenter);
    
    // If dot > 0, the right side is towards the center. So we want the LEFT side (outside).
    if (Math.abs(dot) < 0.1) return "CENTER";
    return dot > 0 ? "LEFT" : "RIGHT";
  }
}
