import * as THREE from 'three';

export const damp = (
  current: number,
  target: number,
  smoothing: number,
  dt: number
) => {
  if (Math.abs(current - target) < 0.001) return target;
  return THREE.MathUtils.lerp(current, target, 1 - Math.exp(-smoothing * dt));
};

export const dampVec3 = (
  current: THREE.Vector3,
  target: THREE.Vector3,
  smoothing: number,
  dt: number
) => {
  if (current.distanceToSquared(target) < 0.00001) {
    current.copy(target);
    return;
  }
  current.x = damp(current.x, target.x, smoothing, dt);
  current.y = damp(current.y, target.y, smoothing, dt);
  current.z = damp(current.z, target.z, smoothing, dt);
};
