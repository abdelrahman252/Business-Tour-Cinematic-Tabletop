/**
 * BUSINESS TOUR — PREMIUM EDITION
 * CornerTiles v2 — Board Corner Architectural Caps
 *
 * Construction:
 *   Each corner receives a layered gold cap:
 *   - Outer square plate (antique gold)
 *   - Inner obsidian inset square (recessed)
 *   - Micro corner pip (emissive highlight)
 *
 *   These corners reinforce the board as a manufactured physical object.
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { goldMat } from '@/utils/materials';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';

const cornerInsetMat = new THREE.MeshStandardMaterial({
  color: 0x141008,
  roughness: 0.40,
  metalness: 0.30,
  envMapIntensity: 0.6,
});

const cornerPipMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: colors.board.emblem,
  emissiveIntensity: 0.20,
  roughness: 1.0,
  metalness: 0.0,
});

export function CornerTiles() {
  const { width: W, depth: D, height: H } = boardConfig.dimensions;
  const { thickness } = boardConfig.frame;

  // Corner positions — board corners, sitting on the surface
  const cornerPositions = useMemo(() => [
    [-W / 2 + thickness / 2, H / 2, -D / 2 + thickness / 2],
    [ W / 2 - thickness / 2, H / 2, -D / 2 + thickness / 2],
    [-W / 2 + thickness / 2, H / 2,  D / 2 - thickness / 2],
    [ W / 2 - thickness / 2, H / 2,  D / 2 - thickness / 2],
  ] as const, [W, D, H, thickness]);

  const capSize    = thickness * 0.92;
  const capHeight  = 0.048;
  const insetSize  = capSize * 0.62;
  const insetRaise = capHeight + 0.003;
  const pipR       = 0.016;

  return (
    <group>
      {cornerPositions.map((pos, idx) => (
        <group key={`corner-cap-${idx}`} position={pos}>
          {/* Gold outer cap */}
          <mesh material={goldMat} position={[0, capHeight / 2, 0]} castShadow>
            <boxGeometry args={[capSize, capHeight, capSize]} />
          </mesh>

          {/* Obsidian inset (recessed square) */}
          <mesh material={cornerInsetMat} position={[0, insetRaise, 0]}>
            <boxGeometry args={[insetSize, 0.005, insetSize]} />
          </mesh>

          {/* Emissive gold pip at center */}
          <mesh material={cornerPipMat} position={[0, insetRaise + 0.004, 0]}>
            <cylinderGeometry args={[pipR, pipR, 0.006, 16]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
