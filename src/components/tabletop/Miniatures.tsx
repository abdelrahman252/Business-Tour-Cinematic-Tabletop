import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface MiniatureProps {
  color: number;
  position: [number, number, number];
  index: number;
}

function Miniature({ color, position, index }: MiniatureProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      groupRef.current.position.y = 0.25 + 0.22 / 2 + 0.035 / 2 + Math.sin(t * 0.8 + index * 1.4) * 0.022;
      groupRef.current.rotation.y = Math.sin(t * 0.3 + index * 0.9) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={position} castShadow>
      <mesh>
        <cylinderGeometry args={[0.085, 0.1, 0.035, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <coneGeometry args={[0.055, 0.22, 12]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  );
}

export function Miniatures() {
  const pieces = [
    { color: 0xc0392b, x: -3.4, z: 3.4 },
    { color: 0x2980b9, x: 3.4, z: 3.4 },
    { color: 0x27ae60, x: -3.4, z: -3.4 },
    { color: 0xf39c12, x: 3.4, z: -3.4 },
  ];

  return (
    <>
      {pieces.map((p, i) => (
        <Miniature key={i} color={p.color} position={[p.x, 0.25 + 0.22 / 2 + 0.035 / 2, p.z]} index={i} />
      ))}
    </>
  );
}
