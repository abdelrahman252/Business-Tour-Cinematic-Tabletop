/**
 * BUSINESS TOUR — PREMIUM EDITION
 * BoardBase v2 — Physical Board Shell
 *
 * Construction:
 *   The board body is a thick obsidian slab with:
 *   - Multi-face material assignment (surface vs edge differentiation)
 *   - Burnished gold bevel rim running the board perimeter
 *   - Four precision-machined cylindrical feet
 *   - Subtle bottom-face material (felt-dark, non-reflective)
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { boardEdgeMat, boardSurfaceMat } from '@/utils/materials';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';

// Foot material — dark satin turned metal
const footMat = new THREE.MeshStandardMaterial({
  color: colors.board.feet,
  roughness: 0.28,
  metalness: 0.68,
  envMapIntensity: 0.7,
});

// Bevel rim — runs the full board perimeter just above the surface plane
// Gives a machined-edge premium separation between field and frame
const bevelRimMat = new THREE.MeshStandardMaterial({
  color: 0x7a5c18,   // Dark warm brass — oxidised
  roughness: 0.30,
  metalness: 0.80,
  envMapIntensity: 1.0,
  emissive: 0x3a2808,
  emissiveIntensity: 0.04,
});

export function BoardBase() {
  const { width: W, depth: D, height: H } = boardConfig.dimensions;
  const { offset: footOff, height: footH, radius: footR, depth: footD } = boardConfig.feet;

  const footPositions = useMemo(() => [
    [-W / 2 + footOff, -H / 2 - footH * 0.5, -D / 2 + footOff],
    [ W / 2 - footOff, -H / 2 - footH * 0.5, -D / 2 + footOff],
    [-W / 2 + footOff, -H / 2 - footH * 0.5,  D / 2 - footOff],
    [ W / 2 - footOff, -H / 2 - footH * 0.5,  D / 2 - footOff],
  ] as const, [W, D, H, footOff, footH]);

  // Bevel rim — thin bar running along each board edge at surface level
  const bevelRims = useMemo(() => {
    const rimH = 0.012;
    const rimD = 0.018;
    const yOff = H / 2 + rimH / 2;
    return [
      { w: W,           d: rimD, x: 0,        z:  D / 2 },
      { w: W,           d: rimD, x: 0,        z: -D / 2 },
      { w: rimD,        d: D,   x:  W / 2,    z: 0 },
      { w: rimD,        d: D,   x: -W / 2,    z: 0 },
    ].map(r => ({ ...r, y: yOff, h: rimH }));
  }, [W, D, H]);

  return (
    <group>
      {/* Board body — 6-face material: top=surface, sides=edge */}
      <mesh
        material={[
          boardEdgeMat,    // right  (+X)
          boardEdgeMat,    // left   (-X)
          boardSurfaceMat, // top    (+Y)  ← the playing field
          boardEdgeMat,    // bottom (-Y)
          boardEdgeMat,    // front  (+Z)
          boardEdgeMat,    // back   (-Z)
        ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[W, H, D]} />
      </mesh>

      {/* Bevel rim — oxidised brass edge separator */}
      {bevelRims.map((rim, idx) => (
        <mesh
          key={`bevel-rim-${idx}`}
          position={[rim.x, rim.y, rim.z]}
          material={bevelRimMat}
        >
          <boxGeometry args={[rim.w, rim.h, rim.d]} />
        </mesh>
      ))}

      {/* Board feet — precision-turned cylinders */}
      {footPositions.map((pos, idx) => (
        <mesh key={`foot-${idx}`} position={pos} material={footMat} castShadow>
          <cylinderGeometry args={[footR, footR * 0.85, footD, 12]} />
        </mesh>
      ))}

      {/* Foot base rings — gold collar detail */}
      {footPositions.map((pos, idx) => (
        <mesh
          key={`foot-ring-${idx}`}
          position={[pos[0], pos[1] + footD * 0.42, pos[2]]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[footR * 1.12, 0.008, 6, 20]} />
          <meshStandardMaterial
            color={colors.board.frame}
            roughness={0.22}
            metalness={0.88}
            envMapIntensity={1.2}
          />
        </mesh>
      ))}
    </group>
  );
}
