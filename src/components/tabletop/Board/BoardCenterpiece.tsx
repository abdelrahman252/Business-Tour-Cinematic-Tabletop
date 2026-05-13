import React, { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';
import { goldMat } from '@/utils/materials';

export function BoardCenterpiece() {
  const { height: boardHeight } = boardConfig.dimensions;
  const { radius, thickness, innerRingRadius, innerRingThickness } = boardConfig.centerEmblem;
  const ringRef = useRef<Group>(null);
  const y = boardHeight / 2 + thickness / 2 + 0.01;

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, y, 0]} receiveShadow>
        <cylinderGeometry args={[radius, radius, thickness, 72]} />
        <meshStandardMaterial color={0x172216} roughness={0.34} metalness={0.22} envMapIntensity={0.7} />
      </mesh>

      <group ref={ringRef} position={[0, boardHeight / 2 + 0.04, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
          <torusGeometry args={[innerRingRadius, innerRingThickness, 8, 72]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[innerRingRadius * 0.63, innerRingThickness * 0.55, 8, 72]} />
          <meshStandardMaterial color={colors.board.premium} roughness={0.18} metalness={0.7} emissive={colors.board.premium} emissiveIntensity={0.03} />
        </mesh>
      </group>

      {[
        { x: 0, z: -0.74, w: 1.16, d: 0.035 },
        { x: 0, z: 0.74, w: 1.16, d: 0.035 },
        { x: -0.74, z: 0, w: 0.035, d: 1.16 },
        { x: 0.74, z: 0, w: 0.035, d: 1.16 },
      ].map((bar, index) => (
        <mesh key={`center-inlay-${index}`} position={[bar.x, boardHeight / 2 + 0.035, bar.z]}>
          <boxGeometry args={[bar.w, 0.012, bar.d]} />
          <meshStandardMaterial color={0x5f4923} roughness={0.25} metalness={0.72} envMapIntensity={0.9} />
        </mesh>
      ))}

      <Text
        position={[0, boardHeight / 2 + 0.072, -0.06]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.24}
        color={colors.board.tileText}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.9}
        textAlign="center"
        outlineColor={0x060403}
        outlineWidth={0.01}
      >
        BUSINESS TOUR
      </Text>

      <Text
        position={[0, boardHeight / 2 + 0.074, 0.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.072}
        color={colors.board.tileMutedText}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.55}
        textAlign="center"
        outlineColor={0x060403}
        outlineWidth={0.004}
      >
        WORLD CAPITALS
      </Text>
    </group>
  );
}
