import React, { useMemo } from 'react';
import { goldMat } from '@/utils/materials';
import { boardConfig } from '@/data/boardConfig';

export function CornerTiles() {
  const { width: W, depth: D, height: H } = boardConfig.dimensions;
  const { thickness } = boardConfig.frame;

  const cornerPositions = useMemo(() => [
    [-W / 2 + thickness, H / 2, -D / 2 + thickness],
    [W / 2 - thickness, H / 2, -D / 2 + thickness],
    [-W / 2 + thickness, H / 2, D / 2 - thickness],
    [W / 2 - thickness, H / 2, D / 2 - thickness],
  ] as const, [W, D, H, thickness]);

  return (
    <group>
      {cornerPositions.map((pos, idx) => (
        <mesh key={`corner-${idx}`} position={pos} material={goldMat}>
          <boxGeometry args={[0.22, 0.04, 0.22]} />
        </mesh>
      ))}
    </group>
  );
}
