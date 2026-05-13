import React, { forwardRef } from 'react';
import * as THREE from 'three';
import { goldMat } from '@/utils/materials';
import { usePawnStore } from '@/stores/usePawnStore';
import { useCameraStore } from '@/stores/useCameraStore';

export const Pawn = forwardRef<THREE.Group, {}>((props, ref) => {
  const moveBySteps = usePawnStore(state => state.moveBySteps);
  const { mode, setMode } = useCameraStore();

  const handleClick = (e: any) => {
    e.stopPropagation();
    // Test moving 3 steps on click, and toggle follow mode if we aren't in it
    if (mode !== 'FOLLOW') setMode('FOLLOW');
    moveBySteps(3);
  };

  return (
    <group ref={ref} {...props} onClick={handleClick}>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} material={goldMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.1, 32]} />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 0.35, 0]} material={goldMat} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.18, 0.5, 32]} />
      </mesh>
      
      {/* Neck ring */}
      <mesh position={[0, 0.6, 0]} material={goldMat} castShadow receiveShadow>
        <torusGeometry args={[0.1, 0.03, 16, 32]} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.75, 0]} material={goldMat} castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
      </mesh>

      {/* Subtle point light so it stands out cinematically */}
      <pointLight color="#ffddaa" intensity={0.5} distance={1.5} position={[0, 1.5, 0]} />
    </group>
  );
});

Pawn.displayName = 'Pawn';
