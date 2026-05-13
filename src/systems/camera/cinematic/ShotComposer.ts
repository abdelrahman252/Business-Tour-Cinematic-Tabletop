import * as THREE from 'three';
import { FramingProfile } from './FramingProfiles';

export interface ShotComposition {
  cameraPositionOffset: THREE.Vector3;
  lookAtOffset: THREE.Vector3;
  fov: number;
  positionDamping: number;
  rotationDamping: number;
}

export class ShotComposer {
  public static compose(
    profile: FramingProfile,
    movementDir: THREE.Vector3,
    shoulderMultiplier: number,
    noiseIntensity: number = 0
  ): ShotComposition {
    const cameraPositionOffset = new THREE.Vector3();
    const lookAtOffset = new THREE.Vector3();

    // 1. Base distance behind the character
    cameraPositionOffset.copy(movementDir).multiplyScalar(-profile.distance);

    // 2. Height offset
    cameraPositionOffset.y += profile.height;

    // 3. Shoulder offset (Side Framing)
    const upVector = new THREE.Vector3(0, 1, 0);
    const rightVector = new THREE.Vector3().crossVectors(movementDir, upVector).normalize();
    
    // Apply shoulder offset from profile, scaled by the chosen side
    cameraPositionOffset.addScaledVector(rightVector, shoulderMultiplier * profile.shoulderOffset);

    // 4. Look ahead offset
    lookAtOffset.copy(movementDir).multiplyScalar(profile.lookAhead);

    // 5. Cinematic Noise (Very subtle breathing / micro drift)
    // REDUCED SIGNIFICANTLY for tighter feel
    if (noiseIntensity > 0) {
      const time = performance.now() * 0.001;
      const swayX = Math.sin(time * 0.5) * 0.01 * noiseIntensity; // was 0.05
      const swayY = Math.cos(time * 0.4) * 0.005 * noiseIntensity; // was 0.03
      
      cameraPositionOffset.addScaledVector(rightVector, swayX);
      cameraPositionOffset.y += swayY;
    }

    return {
      cameraPositionOffset,
      lookAtOffset,
      fov: profile.fov,
      positionDamping: profile.positionDamping,
      rotationDamping: profile.rotationDamping
    };
  }
}


