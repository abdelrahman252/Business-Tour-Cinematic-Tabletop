/**
 * useCameraReset
 *
 * Triggers a smooth cinematic reset of the camera to the default board angle.
 * Works by:
 *   1. Exiting any active interaction mode
 *   2. Letting CameraDirector smoothly lerp back to BOARD defaults
 *
 * The CameraDirector's own damping (2.5) handles the smooth return.
 * We just need to clear any active mode and let it take over.
 */

import { useCallback } from 'react';
import { useInteractionStore } from '@/stores/useInteractionStore';
import { useCameraStore } from '@/stores/useCameraStore';

export function useCameraReset() {
  const setMode = useInteractionStore((s) => s.setMode);
  const setCameraMode = useCameraStore((s) => s.setMode);

  const resetCamera = useCallback(() => {
    // Exit any interaction mode — CameraDirector takes back control
    setMode(null);

    // Ensure we're in BOARD mode for the drift camera
    const currentCameraMode = useCameraStore.getState().mode;
    if (currentCameraMode !== 'BOARD' && currentCameraMode !== 'FOLLOW' && currentCameraMode !== 'DICE') {
      setCameraMode('BOARD');
    }
  }, [setMode, setCameraMode]);

  return resetCamera;
}
