import React, { useMemo } from 'react';
import { goldMat } from '@/utils/materials';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';

export function EdgeTiles() {
  const { width: W, depth: D, height: H } = boardConfig.dimensions;
  const { thickness, height: frameH } = boardConfig.frame;
  const { lineCount, lineHeight: lineH } = boardConfig.grid;

  const cellSize = (W - thickness * 2) / lineCount;
  const tileBand = cellSize;
  const dividerWidth = 0.018;

  const frameParts = useMemo(() => [
    { w: W, d: thickness, x: 0, z: (D / 2 - thickness / 2) },
    { w: W, d: thickness, x: 0, z: -(D / 2 - thickness / 2) },
    { w: thickness, d: D - thickness * 2, x: (W / 2 - thickness / 2), z: 0 },
    { w: thickness, d: D - thickness * 2, x: -(W / 2 - thickness / 2), z: 0 },
  ], [W, D, thickness]);

  const dividers = useMemo(() => {
    const arr: { axis: 'x' | 'z'; x: number; z: number; w: number; d: number }[] = [];
    const min = -W / 2 + thickness;
    const max = W / 2 - thickness;

    for (let i = 1; i < lineCount; i++) {
      const boundary = min + i * cellSize;

      arr.push({ axis: 'x', x: boundary, z: max - tileBand / 2, w: dividerWidth, d: tileBand });
      arr.push({ axis: 'x', x: boundary, z: min + tileBand / 2, w: dividerWidth, d: tileBand });
      arr.push({ axis: 'z', x: min + tileBand / 2, z: boundary, w: tileBand, d: dividerWidth });
      arr.push({ axis: 'z', x: max - tileBand / 2, z: boundary, w: tileBand, d: dividerWidth });
    }

    return arr;
  }, [W, thickness, lineCount, cellSize, tileBand]);

  return (
    <group>
      {frameParts.map((part, idx) => (
        <mesh key={`frame-${idx}`} position={[part.x, H / 2 + frameH / 2, part.z]} material={goldMat}>
          <boxGeometry args={[part.w, frameH, part.d]} />
        </mesh>
      ))}

      {dividers.map((line, idx) => (
        <mesh key={`perimeter-divider-${idx}`} position={[line.x, H / 2 + lineH / 2 + 0.018, line.z]}>
          <boxGeometry args={[line.w, lineH, line.d]} />
          <meshStandardMaterial color={colors.board.lines} roughness={0.32} metalness={0.45} envMapIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
