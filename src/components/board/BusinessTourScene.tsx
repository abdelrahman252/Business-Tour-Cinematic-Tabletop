'use client';
/**
 * BusinessTourScene
 *
 * Drop-in replacement for your existing Three.js/R3F scene root.
 * Wires the new Business Tour board into your existing:
 *   - SceneLighting
 *   - SceneEnvironment
 *   - FloatingParticles
 *   - PostProcessing
 *   - CinematicDock UI
 *   - Pawn system
 *   - Camera stores
 *
 * Usage (in your App.tsx or page.tsx):
 *   import { BusinessTourScene } from '@/components/board/BusinessTourScene'
 *   ...
 *   <Canvas ...>
 *     <BusinessTourScene />
 *   </Canvas>
 */

import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

import { Board } from '@/components/board/Board';
import { SceneLighting } from '@/components/atmosphere/SceneLighting';
import { SceneEnvironment } from '@/components/atmosphere/SceneEnvironment';
import { FloatingParticles } from '@/components/atmosphere/FloatingParticles';
import { PostProcessing } from '@/components/cinematic/PostProcessing';
import { Pawn } from '@/components/pawn/Pawn';

import { usePawnStore } from '@/stores/usePawnStore';
import { useCameraStore } from '@/stores/useCameraStore';

// ─── Pawn controller (keeps pawn tracking path positions) ──────────────────

function PawnController() {
  const pawnRef = useRef<THREE.Group>(null);
  const { path, currentTileIndex, targetTileIndex, isMoving, onStepComplete } = usePawnStore();

  useFrame((_, delta) => {
    if (!pawnRef.current || path.length === 0) return;

    const target = path[targetTileIndex];
    if (!target) return;

    const pawnPos = pawnRef.current.position;
    const targetPos = target.position;

    // Arc hop between tiles
    const dist = pawnPos.distanceTo(targetPos);
    if (dist > 0.01) {
      const speed = 4.5;
      const t = Math.min(1, (speed * delta) / dist);
      pawnPos.lerp(targetPos, t);

      // Vertical arc
      const progress = 1 - dist / Math.max(dist, 0.8);
      pawnRef.current.position.y = targetPos.y + Math.sin(progress * Math.PI) * 0.35;
    } else {
      pawnRef.current.position.copy(targetPos);
      if (isMoving && currentTileIndex !== targetTileIndex) {
        onStepComplete();
      }
    }

    // Face direction of travel
    if (dist > 0.05) {
      const dir = new THREE.Vector3().subVectors(targetPos, pawnPos).normalize();
      const angle = Math.atan2(dir.x, dir.z);
      pawnRef.current.rotation.y = THREE.MathUtils.lerp(
        pawnRef.current.rotation.y,
        angle,
        0.12
      );
    }
  });

  // Initialize pawn on mount
  useEffect(() => {
    const { initialize, path: p } = usePawnStore.getState();
    initialize();
    // Place pawn at start tile immediately
    setTimeout(() => {
      const freshPath = usePawnStore.getState().path;
      if (pawnRef.current && freshPath.length > 0) {
        pawnRef.current.position.copy(freshPath[0].position);
      }
    }, 50);
  }, []);

  return <Pawn ref={pawnRef} />;
}

// ─── Camera director (simplified — uses your existing store) ─────────────────

function CameraDirector() {
  const { mode } = useCameraStore();
  const { path, currentTileIndex } = usePawnStore();

  useFrame((state) => {
    if (mode === 'FOLLOW' && path.length > 0) {
      const tile = path[currentTileIndex];
      if (!tile) return;
      const target = new THREE.Vector3(
        tile.position.x,
        tile.position.y + 0.5,
        tile.position.z
      );
      // Gentle camera lean toward pawn
      state.camera.position.lerp(
        new THREE.Vector3(target.x + 1.5, target.y + 4, target.z + 4),
        0.03
      );
    }
  });

  return null;
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function BusinessTourScene() {
  return (
    <>
      <SceneEnvironment />
      <SceneLighting />

      <Suspense fallback={null}>
        <FloatingParticles />
        <Board />
        <PawnController />
        <CameraDirector />
      </Suspense>

      <PostProcessing />
    </>
  );
}
