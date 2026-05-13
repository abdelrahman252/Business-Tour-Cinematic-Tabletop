'use client';
/**
 * CameraStateBridge
 * 
 * Lives inside the R3F Canvas. Every frame, writes the current camera
 * position + lookAt into a stable external ref so DOM components
 * (like InspectModeButton) can read it without React re-renders.
 */
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MutableRefObject } from 'react';

export interface CameraSnapshot {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

interface Props {
  snapshotRef: MutableRefObject<CameraSnapshot>;
}

// Internal smoothed lookAt for reading (mirrors CameraDirector's currentLookAt)
const _smoothedLookAt = new THREE.Vector3();

export function CameraStateBridge({ snapshotRef }: Props) {
  const { camera } = useThree();

  useFrame(() => {
    // We can't directly read CameraDirector's internal currentLookAt,
    // so we approximate by projecting camera forward to board plane (y=0)
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    
    // Ray-cast to y=0 plane
    if (Math.abs(dir.y) > 0.001) {
      const t = -camera.position.y / dir.y;
      if (t > 0 && t < 30) {
        _smoothedLookAt.copy(camera.position).addScaledVector(dir, t);
        _smoothedLookAt.y = 0;
      }
    }

    snapshotRef.current.position.copy(camera.position);
    snapshotRef.current.lookAt.copy(_smoothedLookAt);
  });

  return null;
}
