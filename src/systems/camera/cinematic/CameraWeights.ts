import { FramingProfile, FramingProfiles, ShotType } from './FramingProfiles';
import * as THREE from 'three';

export class CameraWeights {
  public static blendProfiles(
    baseShot: ShotType,
    targetShot: ShotType,
    weight: number // 0 to 1
  ): FramingProfile {
    const base = FramingProfiles[baseShot];
    const target = FramingProfiles[targetShot];
    
    // Smoothstep the weight for softer transitions
    const t = THREE.MathUtils.smoothstep(weight, 0, 1);

    return {
      distance: THREE.MathUtils.lerp(base.distance, target.distance, t),
      height: THREE.MathUtils.lerp(base.height, target.height, t),
      fov: THREE.MathUtils.lerp(base.fov, target.fov, t),
      lookAhead: THREE.MathUtils.lerp(base.lookAhead, target.lookAhead, t),
      positionDamping: THREE.MathUtils.lerp(base.positionDamping, target.positionDamping, t),
      rotationDamping: THREE.MathUtils.lerp(base.rotationDamping, target.rotationDamping, t),
      shoulderOffset: THREE.MathUtils.lerp(base.shoulderOffset, target.shoulderOffset, t)
    };
  }
}

