export function Dice({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <mesh position={[x, 0.25 + 0.22 / 2 + 0.025, z]} rotation={[0.2, rotation, 0.1]} castShadow>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <meshStandardMaterial color={0xf5f0e8} roughness={0.25} metalness={0.05} />
      
      {/* Pips */}
      <mesh position={[0, 0.111, 0.04]}>
        <sphereGeometry args={[0.016, 6, 6]} />
        <meshStandardMaterial color={0x1a1208} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.111, -0.04]}>
        <sphereGeometry args={[0.016, 6, 6]} />
        <meshStandardMaterial color={0x1a1208} roughness={0.6} />
      </mesh>
    </mesh>
  );
}
