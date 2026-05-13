'use client';

/**
 * DragController — Pure Pointer-Event Camera Pan
 *
 * ARCHITECTURE (mandatory spec compliance):
 *
 * - NO OrbitControls / MapControls / CameraControls / drei controls.
 * - NO useFrame for movement.
 * - NO velocity, inertia, smoothing, damping, lerp, or decay.
 * - Camera rotation is LOCKED via quaternion copy every pointermove.
 * - Camera moves ONLY inside pointermove via direct position mutation.
 * - pointerup → isDragging = false → NOTHING ELSE. Movement ceases instantly.
 *
 * Feel: grabbing the table surface and sliding — mechanically locked,
 * zero spin, zero drift, zero roll, zero orbit behavior.
 */

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── tunables ─────────────────────────────────────────────────────────────────
const PAN_SPEED  = 0.018;
const PAN_LIMIT  = 22;

// ─── scratch vectors (never reallocated) ──────────────────────────────────────
const _right   = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _delta   = new THREE.Vector3();
const _up      = new THREE.Vector3(0, 1, 0);

// ─── component ────────────────────────────────────────────────────────────────
export function DragController() {
  const { camera, gl } = useThree();

  const camRef    = useRef(camera);
  const canvasRef = useRef<HTMLCanvasElement>(gl.domElement);

  camRef.current = camera;

  useEffect(() => {
    const canvas = canvasRef.current;
    const cam    = camRef.current;

    // Lock camera rotation on mount — snapshot the quaternion RIGHT NOW.
    // Restored every pointermove so nothing can ever spin, roll, or yaw.
    const lockedRotation = cam.quaternion.clone();

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;

      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;

      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;

      // 1. Lock rotation — enforced every event
      cam.quaternion.copy(lockedRotation);

      // 2. Raw delta — no accumulation, no buffering
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;

      if (dx === 0 && dy === 0) return;

      // 3. World-space axes from locked rotation — project onto XZ only
      cam.getWorldDirection(_forward);
      _forward.y = 0;
      _forward.normalize();
      _right.crossVectors(_forward, _up).normalize();

      // 4. Move camera position ONLY — RTS map-drag feel
      // mouse right → camera moves left (subtract dx)
      // mouse down  → camera moves back (add dy)
      _delta.set(0, 0, 0)
        .addScaledVector(_right,   -dx * PAN_SPEED)
        .addScaledVector(_forward,  dy * PAN_SPEED);

      cam.position.add(_delta);

      // 5. Clamp
      cam.position.x = THREE.MathUtils.clamp(cam.position.x, -PAN_LIMIT, PAN_LIMIT);
      cam.position.z = THREE.MathUtils.clamp(cam.position.z, -PAN_LIMIT, PAN_LIMIT);
    };

    const onPointerUp = () => {
      // HARD STOP — flag only, nothing else.
      isDragging = false;
      canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointerdown',   onPointerDown);
    canvas.addEventListener('pointermove',   onPointerMove);
    canvas.addEventListener('pointerup',     onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave',  onPointerUp);
    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('pointerdown',   onPointerDown);
      canvas.removeEventListener('pointermove',   onPointerMove);
      canvas.removeEventListener('pointerup',     onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave',  onPointerUp);
      canvas.style.cursor = 'default';
    };
  }, []);

  return null;
}
