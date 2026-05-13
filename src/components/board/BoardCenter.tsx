'use client';
import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const goldMat = new THREE.MeshStandardMaterial({
  color: '#c8a028',
  metalness: 0.95,
  roughness: 0.12,
  emissive: '#7a5a00',
  emissiveIntensity: 0.25,
});

const darkMat = new THREE.MeshStandardMaterial({
  color: '#0a0806',
  metalness: 0.1,
  roughness: 0.9,
});

export function BoardCenter() {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.y = t * 0.08;
    }
    if (glowRef.current) {
      glowRef.current.intensity = 0.4 + Math.sin(t * 1.2) * 0.15;
    }
  });

  const Y = 0.065; // just above board surface

  return (
    <group position={[0, Y, 0]}>

      {/* ── Outer decorative circle ───────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <primitive object={goldMat} attach="material" />
      </mesh>

      {/* ── Mid circle ───────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.33, 64]} />
        <primitive object={goldMat} attach="material" />
      </mesh>

      {/* ── Rotating dashed ring ─────────────────────────── */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.55, 2.57, 48]} />
        <meshStandardMaterial
          color="#c8a028"
          emissive="#c8a028"
          emissiveIntensity={0.4}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* ── Inner filled disc ────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.28, 64]} />
        <primitive object={darkMat} attach="material" />
      </mesh>

      {/* ── Hexagon logo frame ────────────────────────────── */}
      {/* Six-sided prism as the M badge */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.30, 0.34, 6]} />
        <primitive object={goldMat} attach="material" />
      </mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 6]}>
        <ringGeometry args={[0.22, 0.24, 6]} />
        <primitive object={goldMat} attach="material" />
      </mesh>

      {/* ── M letter ─────────────────────────────────────── */}
      <Text
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        color="#c8a028"
        font="https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gt7-GU.woff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.02}
      >
        M
      </Text>

      {/* ── BUSINESS TOUR title ───────────────────────────── */}
      <Text
        position={[0, 0.018, 0.58]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.155}
        color="#c8a028"
        font="https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gt7-GU.woff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
        maxWidth={4}
        textAlign="center"
      >
        BUSINESS TOUR
      </Text>

      {/* ── WORLD CAPITALS subtitle ───────────────────────── */}
      <Text
        position={[0, 0.016, 0.82]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.07}
        color="#9a7828"
        font="https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gt7-GU.woff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.32}
        maxWidth={3.5}
        textAlign="center"
      >
        WORLD CAPITALS
      </Text>

      {/* ── Cardinal direction arrows (decorative) ───────── */}
      {[
        [0, 0, -1.8, 0],
        [0, 0,  1.8, Math.PI],
        [-1.8, 0, 0, Math.PI / 2],
        [ 1.8, 0, 0, -Math.PI / 2],
      ].map(([x, , z, ry], i) => (
        <mesh key={i} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, ry]}>
          <coneGeometry args={[0.04, 0.10, 4]} />
          <primitive object={goldMat} attach="material" />
        </mesh>
      ))}

      {/* ── Warm center glow ─────────────────────────────── */}
      <pointLight
        ref={glowRef}
        color="#c8a028"
        intensity={0.4}
        distance={5}
        position={[0, 0.5, 0]}
        decay={2}
      />
    </group>
  );
}
