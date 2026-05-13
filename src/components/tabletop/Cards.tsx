export function Card({ x, z, rotY = 0, color = 0xd4a84b, rotZ = 0 }: { x: number; z: number; rotY?: number; color?: number; rotZ?: number }) {
  return (
    <group position={[x, 0.25 + 0.22 + 0.015, z]} rotation={[0, rotY, rotZ]} castShadow>
      <mesh>
        <boxGeometry args={[0.55, 0.012, 0.38]} />
        <meshStandardMaterial color={0xf2ead8} roughness={0.4} metalness={0.0} />
      </mesh>
      <mesh position={[0, -0.001, 0]}>
        <boxGeometry args={[0.50, 0.013, 0.33]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </mesh>
    </group>
  );
}

export function Cards() {
  const reds = Array.from({ length: 5 }).map((_, i) => ({
    x: -3.5 + i * 0.012,
    z: -3.0 - i * 0.003,
    rotY: 0.12,
    color: 0xc0392b,
    rotZ: (Math.random() - 0.5) * 0.06
  }));

  const blues = Array.from({ length: 5 }).map((_, i) => ({
    x: 3.5 + i * 0.012,
    z: -3.0 - i * 0.003,
    rotY: -0.08,
    color: 0x2980b9,
    rotZ: (Math.random() - 0.5) * 0.06
  }));

  return (
    <>
      {reds.map((props, i) => <Card key={`red-${i}`} {...props} />)}
      {blues.map((props, i) => <Card key={`blue-${i}`} {...props} />)}
    </>
  );
}
