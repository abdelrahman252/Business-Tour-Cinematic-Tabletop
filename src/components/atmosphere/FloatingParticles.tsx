import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import { colors } from '@/data/colors';

export function FloatingParticles() {
  const count = 140;  // was 280 — fewer particles, less visual noise
  const particlesRef = useRef<Points>(null);

  const [positions, scales] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scl = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = Math.random() * 6 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
      scl[i] = Math.random() * 0.8 + 0.2;
    }
    return [pos, scl];
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const t = state.clock.getElapsedTime();
      const pPos = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < pPos.length; i += 3) {
        pPos[i + 1] += 0.0012 + (i / pPos.length) * 0.0008;
        pPos[i] += Math.sin(t * 0.5 + i) * 0.0004;
        if (pPos[i + 1] > 7) pPos[i + 1] = 0.5;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-scale"
          count={count}
          args={[scales, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={colors.atmosphere.particles}
        size={0.022}        // was 0.03 — smaller, less distracting
        transparent
        opacity={0.22}      // was 0.35 — quieter presence
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
