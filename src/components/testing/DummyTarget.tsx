import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCameraStore } from '@/stores/useCameraStore';

export function DummyTarget() {
  const meshRef = useRef<THREE.Mesh>(null);
  const setTargetPosition = useCameraStore((state) => state.setTargetPosition);
  const mode = useCameraStore((state) => state.mode);
  const setMode = useCameraStore((state) => state.setMode);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Move in a circle
      const radius = 3;
      const speed = 0.5;
      const x = Math.sin(t * speed) * radius;
      const z = Math.cos(t * speed) * radius;
      
      meshRef.current.position.set(x, 0.5, z);
      
      // Keep store updated with current position
      setTargetPosition([x, 0.5, z]);
    }
  });

  const toggleMode = (e: any) => {
    e.stopPropagation();
    setMode(mode === 'BOARD' ? 'FOLLOW' : 'BOARD');
  };

  return (
    <mesh ref={meshRef} onClick={toggleMode}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial 
        color="#00ff88" 
        emissive="#00ff88" 
        emissiveIntensity={2} 
        toneMapped={false}
      />
      <pointLight color="#00ff88" intensity={2} distance={3} />
    </mesh>
  );
}
