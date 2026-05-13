import { useMemo } from 'react';
import { createWoodMaterial } from '@/utils/materials';

export function Table() {
  const topMat = useMemo(() => createWoodMaterial(false), []);
  const apronMat = useMemo(() => createWoodMaterial(true), []);
  const legMat = useMemo(() => createWoodMaterial(true), []);

  const legPositions = [
    [-9.5, -3.0, 6.8],
    [9.5, -3.0, 6.8],
    [-9.5, -3.0, -6.8],
    [9.5, -3.0, -6.8],
  ] as const;

  return (
    <group position={[0, -0.5, 0]}>
      {/* Tabletop */}
      <mesh position={[0, -0.275, 0]} material={topMat} receiveShadow castShadow>
        <boxGeometry args={[22, 0.55, 16]} />
      </mesh>

      {/* Apron Front/Back */}
      <mesh position={[0, -0.7, 7.9]} material={apronMat}>
        <boxGeometry args={[20, 0.3, 0.18]} />
      </mesh>
      <mesh position={[0, -0.7, -7.9]} material={apronMat}>
        <boxGeometry args={[20, 0.3, 0.18]} />
      </mesh>

      {/* Apron Left/Right */}
      <mesh position={[-10.9, -0.7, 0]} material={apronMat}>
        <boxGeometry args={[0.18, 0.3, 14]} />
      </mesh>
      <mesh position={[10.9, -0.7, 0]} material={apronMat}>
        <boxGeometry args={[0.18, 0.3, 14]} />
      </mesh>

      {/* Legs */}
      {legPositions.map((pos, idx) => (
        <mesh key={idx} position={pos} material={legMat} castShadow>
          <boxGeometry args={[0.55, 4.5, 0.55]} />
        </mesh>
      ))}

      {/* Reflection Plane */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[22, 16]} />
        <meshStandardMaterial
          color={0x3a1f0a}
          roughness={0.2}
          metalness={0.05}
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
}
