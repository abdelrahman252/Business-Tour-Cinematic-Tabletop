'use client';

/**
 * InspectController — Side Snap Cinematic Camera
 *
 * Owned when InteractionMode === 'INSPECT'. CameraDirector silenced.
 *
 * INPUT:
 *   - Drag left/right on canvas (120px threshold)
 *   - window.__sideSnapGoTo(index) — called by the 4 dock buttons
 *   - window.__sideSnapGetIndex()  — read by dock to highlight active side
 *
 * SIDES:  0=FRONT  1=RIGHT  2=BACK  3=LEFT
 */

import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef, useEffect } from 'react';

export type Side = 'FRONT' | 'RIGHT' | 'BACK' | 'LEFT';

export const SIDE_POSITIONS: Record<Side, THREE.Vector3> = {
  FRONT: new THREE.Vector3( 7.5, 9,  9.5),
  RIGHT: new THREE.Vector3( 9.5, 9, -7.5),
  BACK:  new THREE.Vector3(-7.5, 9, -9.5),
  LEFT:  new THREE.Vector3(-9.5, 9,  7.5),
};

export const SIDE_ORDER: Side[] = ['FRONT', 'RIGHT', 'BACK', 'LEFT'];

const LOOK_AT        = new THREE.Vector3(0, 0, 0);
const DRAG_THRESHOLD = 120;
const LERP_SPEED     = 4.5;

function expLerp(c: number, t: number, s: number, dt: number) {
  return THREE.MathUtils.lerp(c, t, 1 - Math.exp(-s * dt));
}

export function InspectController() {
  const { camera, gl } = useThree();
  const camRef    = useRef(camera);
  const canvasRef = useRef<HTMLCanvasElement>(gl.domElement);
  camRef.current  = camera;

  const currentSideIndex = useRef<number>(0);
  const targetPosition   = useRef(new THREE.Vector3(7.5, 9, 9.5));
  const isDragging       = useRef(false);
  const dragStartX       = useRef(0);
  const dragCommitted    = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const cam    = camRef.current;

    // Snap to nearest side on mount — seamless handoff
    let nearest = 0, nearestDist = Infinity;
    SIDE_ORDER.forEach((side, i) => {
      const d = cam.position.distanceTo(SIDE_POSITIONS[side]);
      if (d < nearestDist) { nearestDist = d; nearest = i; }
    });
    currentSideIndex.current = nearest;
    const mountPos = SIDE_POSITIONS[SIDE_ORDER[nearest]];
    cam.position.copy(mountPos);
    cam.lookAt(LOOK_AT);
    targetPosition.current.copy(mountPos);

    // Expose imperative API for DOM side-buttons
    (window as any).__sideSnapGoTo     = (index: number) => {
      currentSideIndex.current = index;
      targetPosition.current.copy(SIDE_POSITIONS[SIDE_ORDER[index]]);
    };
    (window as any).__sideSnapGetIndex = () => currentSideIndex.current;

    canvas.style.cursor = 'grab';

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDragging.current    = true;
      dragStartX.current    = e.clientX;
      dragCommitted.current = false;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current || dragCommitted.current) return;
      const deltaX = e.clientX - dragStartX.current;
      if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
      const dir   = deltaX > 0 ? -1 : 1;
      const newIdx = (currentSideIndex.current + dir + SIDE_ORDER.length) % SIDE_ORDER.length;
      currentSideIndex.current = newIdx;
      targetPosition.current.copy(SIDE_POSITIONS[SIDE_ORDER[newIdx]]);
      dragCommitted.current = true;
    };

    const onPointerUp = () => {
      isDragging.current = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown',   onPointerDown);
    canvas.addEventListener('pointermove',   onPointerMove);
    canvas.addEventListener('pointerup',     onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave',  onPointerUp);

    return () => {
      delete (window as any).__sideSnapGoTo;
      delete (window as any).__sideSnapGetIndex;
      canvas.removeEventListener('pointerdown',   onPointerDown);
      canvas.removeEventListener('pointermove',   onPointerMove);
      canvas.removeEventListener('pointerup',     onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave',  onPointerUp);
      canvas.style.cursor = 'default';
    };
  }, []);

  useFrame((_, delta) => {
    const cam = camRef.current;
    const tgt = targetPosition.current;
    cam.position.x = expLerp(cam.position.x, tgt.x, LERP_SPEED, delta);
    cam.position.y = expLerp(cam.position.y, tgt.y, LERP_SPEED, delta);
    cam.position.z = expLerp(cam.position.z, tgt.z, LERP_SPEED, delta);
    cam.lookAt(LOOK_AT);
  });

  return null;
}

// ─── Bridge (always mounted inside Canvas) ────────────────────────────────────

export function InspectBridge() {
  const { camera } = useThree();
  useEffect(() => {
    (window as any).__inspectCameraCapture = () => ({
      pos:  [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
      look: [0, 0, 0] as [number, number, number],
    });
    return () => { delete (window as any).__inspectCameraCapture; };
  }, [camera]);
  return null;
}
