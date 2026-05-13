function Token({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, 0.25 + 0.22 + 0.014, z]} castShadow>
      <cylinderGeometry args={[0.08, 0.08, 0.028, 20]} />
      <meshStandardMaterial color={0xc89830} roughness={0.15} metalness={0.95} />
    </mesh>
  );
}

export function Tokens() {
  const positions = [
    [-2.5, 2.8],
    [-2.3, 2.8],
    [-2.1, 2.8],
    [2.5, -2.8],
    [2.3, -2.8]
  ];

  return (
    <>
      {positions.map(([x, z], i) => (
        <Token key={i} x={x} z={z} />
      ))}
    </>
  );
}
