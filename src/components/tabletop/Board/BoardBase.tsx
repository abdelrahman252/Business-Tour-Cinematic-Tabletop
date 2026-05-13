import React, { useMemo } from 'react';
import { boardEdgeMat, boardSurfaceMat } from '@/utils/materials';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';

export function BoardBase() {
  const { width: W, depth: D, height: H } = boardConfig.dimensions;
  const { offset: footOff, height: footH, radius: footR, depth: footD } = boardConfig.feet;

  const footPositions = useMemo(() => [
    [-W / 2 + footOff, -H / 2 - footH, -D / 2 + footOff],
    [W / 2 - footOff, -H / 2 - footH, -D / 2 + footOff],
    [-W / 2 + footOff, -H / 2 - footH, D / 2 - footOff],
    [W / 2 - footOff, -H / 2 - footH, D / 2 - footOff]
  ] as const, [W, D, H, footOff, footH]);

  return (
    <group>
      <mesh material={[boardEdgeMat, boardEdgeMat, boardSurfaceMat, boardEdgeMat, boardEdgeMat, boardEdgeMat]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
      </mesh>

      {footPositions.map((pos, idx) => (
        <mesh key={`foot-${idx}`} position={pos}>
          <cylinderGeometry args={[footR, footH, footD, 8]} />
          <meshStandardMaterial color={colors.board.feet} roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
