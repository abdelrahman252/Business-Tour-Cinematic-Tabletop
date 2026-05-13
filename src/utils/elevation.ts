import * as THREE from 'three';
import { boardConfig } from '@/data/boardConfig';

export function getVisualElevation(z: number) {
  // z ranges from width/2 (near) to -width/2 (far)
  const D = boardConfig.dimensions.depth;
  // Normalize z to 0 (near) -> 1 (far)
  const t = THREE.MathUtils.clamp((D / 2 - z) / D, 0, 1);
  
  // Smoothstep interpolation for a subtle, premium curve
  // total lift around 0.25
  return THREE.MathUtils.smoothstep(t, 0, 1) * 0.25;
}
