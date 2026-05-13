/**
 * BUSINESS TOUR — PREMIUM EDITION
 * EdgeTiles v2 — Frame Rails + Architectural Dividers
 *
 * Construction:
 *   - Four antique gold frame rail bars (outer board perimeter)
 *   - Burnished brass divider lines between tiles
 *   - Corner cap squares at each board corner
 *   - Inner seam line (emissive) just inside the frame rails
 */

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { goldMat, brassMat } from '@/utils/materials';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';

// Inner emissive seam — glows just inside the gold frame
const innerSeamMat = new THREE.MeshStandardMaterial({
  color: 0x000000,
  emissive: colors.board.start,
  emissiveIntensity: 0.08,
  roughness: 1.0,
  metalness: 0.0,
  transparent: true,
  opacity: 0.7,
});

export function EdgeTiles() {
  const { width: W, depth: D, height: H } = boardConfig.dimensions;
  const { thickness, height: frameH } = boardConfig.frame;
  const { lineCount, lineHeight: lineH } = boardConfig.grid;

  const cellSize = (W - thickness * 2) / lineCount;
  const tileBand = cellSize;
  const divW     = 0.014;   // Divider line width — thinner, more precise

  // ── Frame rail bars ─────────────────────────────────────────────────────────
  const frameParts = useMemo(() => [
    { w: W,                     d: thickness, x: 0,              z:  (D / 2 - thickness / 2) },
    { w: W,                     d: thickness, x: 0,              z: -(D / 2 - thickness / 2) },
    { w: thickness,             d: D - thickness * 2, x:  (W / 2 - thickness / 2), z: 0 },
    { w: thickness,             d: D - thickness * 2, x: -(W / 2 - thickness / 2), z: 0 },
  ], [W, D, thickness]);

  // ── Inner seam lines — just inside the frame rails ──────────────────────────
  const innerSeams = useMemo(() => {
    const seamW = 0.008;
    const offset = thickness + seamW / 2;
    return [
      { w: W - thickness * 2, d: seamW, x: 0,             z:  (D / 2 - offset) },
      { w: W - thickness * 2, d: seamW, x: 0,             z: -(D / 2 - offset) },
      { w: seamW,             d: D - thickness * 2, x:  (W / 2 - offset), z: 0 },
      { w: seamW,             d: D - thickness * 2, x: -(W / 2 - offset), z: 0 },
    ];
  }, [W, D, thickness]);

  // ── Tile divider lines ──────────────────────────────────────────────────────
  const dividers = useMemo(() => {
    const arr: { x: number; z: number; w: number; d: number }[] = [];
    const min = -W / 2 + thickness;
    const max =  W / 2 - thickness;

    for (let i = 1; i < lineCount; i++) {
      const boundary = min + i * cellSize;
      // Bottom edge dividers
      arr.push({ x: boundary,           z: max - tileBand / 2, w: divW,     d: tileBand });
      // Top edge dividers
      arr.push({ x: boundary,           z: min + tileBand / 2, w: divW,     d: tileBand });
      // Left edge dividers
      arr.push({ x: min + tileBand / 2, z: boundary,           w: tileBand, d: divW     });
      // Right edge dividers
      arr.push({ x: max - tileBand / 2, z: boundary,           w: tileBand, d: divW     });
    }
    return arr;
  }, [W, thickness, lineCount, cellSize, tileBand]);

  const dividerY  = H / 2 + lineH / 2 + 0.017;
  const frameY    = H / 2 + frameH / 2;
  const seamY     = H / 2 + 0.004;

  return (
    <group>
      {/* ── Gold frame rails ─────────────────────────────────────────────── */}
      {frameParts.map((part, idx) => (
        <mesh key={`frame-${idx}`} position={[part.x, frameY, part.z]} material={goldMat} castShadow>
          <boxGeometry args={[part.w, frameH, part.d]} />
        </mesh>
      ))}

      {/* ── Inner emissive seam ───────────────────────────────────────────── */}
      {innerSeams.map((seam, idx) => (
        <mesh key={`seam-${idx}`} position={[seam.x, seamY, seam.z]} material={innerSeamMat}>
          <boxGeometry args={[seam.w, 0.004, seam.d]} />
        </mesh>
      ))}

      {/* ── Tile divider lines ────────────────────────────────────────────── */}
      {dividers.map((line, idx) => (
        <mesh key={`div-${idx}`} position={[line.x, dividerY, line.z]} material={brassMat}>
          <boxGeometry args={[line.w, lineH, line.d]} />
        </mesh>
      ))}
    </group>
  );
}
