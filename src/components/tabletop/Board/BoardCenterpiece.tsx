/**
 * BUSINESS TOUR — PREMIUM EDITION
 * BoardCenterpiece v2 — The Board's Emblem Heart
 *
 * Construction:
 *   The centerpiece is the board's soul — a layered emblem system:
 *   - Deep forest base disc (the playing field interior)
 *   - Slowly rotating outer gold ring — the main emblem ring
 *   - Slowly counter-rotating inner emerald ring
 *   - Mid ring — dim brass accent
 *   - Four architectural cross-bar inlays in burnished brass
 *   - BUSINESS TOUR wordmark in warm parchment
 *   - WORLD CAPITALS subtitle in dim amber
 *
 *   All rings rotate at different speeds for a layered mechanical feeling.
 */

'use client';

import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Group } from 'three';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';
import { goldMat } from '@/utils/materials';

const emeraldRingMat = new THREE.MeshStandardMaterial({
  color: colors.board.premium,
  roughness: 0.20,
  metalness: 0.68,
  emissive: colors.board.premium,
  emissiveIntensity: 0.05,
  envMapIntensity: 0.8,
});

const midRingMat = new THREE.MeshStandardMaterial({
  color: 0x4a3810,
  roughness: 0.35,
  metalness: 0.72,
  envMapIntensity: 0.7,
});

const crossBarMat = new THREE.MeshStandardMaterial({
  color: 0x5c4416,
  roughness: 0.28,
  metalness: 0.76,
  envMapIntensity: 0.9,
});

export function BoardCenterpiece() {
  const { height: boardH } = boardConfig.dimensions;
  const cfg = boardConfig.centerEmblem;

  const outerRingRef  = useRef<Group>(null);
  const innerRingRef  = useRef<Group>(null);

  const y = boardH / 2 + cfg.thickness / 2 + 0.008;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.y = t * 0.045;    // Slow drift clockwise
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = -t * 0.028;   // Counter-rotate, slower
    }
  });

  return (
    <group>
      {/* ── Base disc — deep forest playing field ───────────────────────── */}
      <mesh position={[0, y, 0]} receiveShadow>
        <cylinderGeometry args={[cfg.radius, cfg.radius, cfg.thickness, 80]} />
        <meshStandardMaterial
          color={0x0c1c12}
          roughness={0.50}
          metalness={0.14}
          envMapIntensity={0.45}
        />
      </mesh>

      {/* ── Outer gold ring — slow clockwise rotation ───────────────────── */}
      <group ref={outerRingRef} position={[0, boardH / 2 + 0.038, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
          <torusGeometry args={[cfg.innerRingRadius, cfg.innerRingThickness, 10, 80]} />
        </mesh>
      </group>

      {/* ── Mid ring — static burnished brass ───────────────────────────── */}
      <mesh
        position={[0, boardH / 2 + 0.034, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        material={midRingMat}
      >
        <torusGeometry args={[cfg.midRingRadius, cfg.midRingThickness, 8, 60]} />
      </mesh>

      {/* ── Inner emerald ring — slow counter-rotation ──────────────────── */}
      <group ref={innerRingRef} position={[0, boardH / 2 + 0.032, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={emeraldRingMat}>
          <torusGeometry args={[cfg.midRingRadius * 0.58, cfg.midRingThickness * 0.7, 8, 60]} />
        </mesh>
      </group>

      {/* ── Cross-bar inlays ─────────────────────────────────────────────── */}
      {[
        { x: 0,                     z: -cfg.crossBarLength / 2 * 0.60, w: cfg.crossBarWidth, d: cfg.crossBarLength * 0.60 },
        { x: 0,                     z:  cfg.crossBarLength / 2 * 0.60, w: cfg.crossBarWidth, d: cfg.crossBarLength * 0.60 },
        { x: -cfg.crossBarLength / 2 * 0.60, z: 0, w: cfg.crossBarLength * 0.60, d: cfg.crossBarWidth },
        { x:  cfg.crossBarLength / 2 * 0.60, z: 0, w: cfg.crossBarLength * 0.60, d: cfg.crossBarWidth },
      ].map((bar, idx) => (
        <mesh
          key={`crossbar-${idx}`}
          position={[bar.x, boardH / 2 + 0.030, bar.z]}
          material={crossBarMat}
        >
          <boxGeometry args={[bar.w, 0.010, bar.d]} />
        </mesh>
      ))}

      {/* ── Wordmark — BUSINESS TOUR ─────────────────────────────────────── */}
      <Text
        position={[0, boardH / 2 + 0.068, -0.055]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.218}
        color={colors.board.tileText}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.85}
        textAlign="center"
        outlineColor={0x040302}
        outlineWidth={0.009}
        material-toneMapped={false}
        letterSpacing={0.04}
      >
        BUSINESS TOUR
      </Text>

      {/* ── Subtitle — WORLD CAPITALS ────────────────────────────────────── */}
      <Text
        position={[0, boardH / 2 + 0.070, 0.22]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.064}
        color={colors.board.tileMutedText}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.50}
        textAlign="center"
        outlineColor={0x040302}
        outlineWidth={0.004}
        material-toneMapped={false}
        letterSpacing={0.12}
      >
        WORLD CAPITALS
      </Text>

      {/* ── Premium Edition badge ─────────────────────────────────────────── */}
      <Text
        position={[0, boardH / 2 + 0.068, 0.44]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.042}
        color={colors.board.emblem}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        outlineColor={0x040302}
        outlineWidth={0.003}
        material-toneMapped={false}
        letterSpacing={0.18}
      >
        PREMIUM EDITION
      </Text>
    </group>
  );
}
