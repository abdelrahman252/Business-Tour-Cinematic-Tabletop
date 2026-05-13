'use client';
import { useEffect, useRef } from 'react';
import { useCameraStore } from '@/stores/useCameraStore';

/**
 * InspectInputController
 * 
 * Captures pointer / wheel events from the canvas and translates them into
 * orbit/pan/zoom deltas fed into the camera store. Active ONLY while in INSPECT mode.
 * 
 * Gesture map:
 *  - Left-drag          → orbit (theta/phi)
 *  - Right-drag         → pan (XZ along board plane)
 *  - Wheel / pinch      → zoom (radius)
 */
export function InspectInputController() {
  const mode = useCameraStore((state) => state.mode);
  const updateOrbit = useCameraStore((state) => state.updateInspectOrbit);
  const updateZoom = useCameraStore((state) => state.updateInspectZoom);
  const updatePan = useCameraStore((state) => state.updateInspectPan);

  const isActive = mode === 'INSPECT';

  const pointerDown = useRef(false);
  const isRightBtn = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      pointerDown.current = true;
      isRightBtn.current = e.button === 2;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      if (isRightBtn.current) {
        // Pan
        updatePan(dx, dy);
      } else {
        // Orbit — horizontal = theta, vertical = phi
        updateOrbit(dx, dy);
      }
    };

    const onPointerUp = () => { pointerDown.current = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      updateZoom(e.deltaY * 0.5);
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    // Touch pinch zoom
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist.current !== null) {
          updateZoom((lastPinchDist.current - dist) * 0.3);
        }
        lastPinchDist.current = dist;
      } else {
        lastPinchDist.current = null;
      }
    };

    const onTouchEnd = () => { lastPinchDist.current = null; };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [isActive, updateOrbit, updateZoom, updatePan]);

  return null;
}
