'use client';
import { useRef } from 'react';
import { PointLight } from 'three';
import { useFrame } from '@react-three/fiber';
import { lightingConfig } from '@/config/lightingConfig';
import { shadowConfig } from '@/config/shadowConfig';

export function SceneLighting() {
  const boardGlowRef = useRef<PointLight>(null);

  useFrame((state) => {
    if (boardGlowRef.current) {
      const t = state.clock.getElapsedTime();
      const { baseIntensity, pulseAmp, pulseFreq } = lightingConfig.boardGlow;
      boardGlowRef.current.intensity = baseIntensity + Math.sin(t * pulseFreq) * pulseAmp;
    }
  });

  return (
    <>
      {/* Key light — upper left, primary illumination */}
      <directionalLight
        position={lightingConfig.keyLight.position}
        color={lightingConfig.keyLight.color}
        intensity={lightingConfig.keyLight.intensity}
        castShadow
        shadow-mapSize={shadowConfig.mapSize as [number, number]}
        shadow-camera-near={shadowConfig.cameraNear}
        shadow-camera-far={shadowConfig.cameraFar}
        shadow-camera-left={shadowConfig.cameraLeft}
        shadow-camera-right={shadowConfig.cameraRight}
        shadow-camera-top={shadowConfig.cameraTop}
        shadow-camera-bottom={shadowConfig.cameraBottom}
        shadow-bias={shadowConfig.bias}
        shadow-radius={shadowConfig.radius}
      />

      {/* Fill light — right side */}
      <directionalLight
        position={lightingConfig.fillLight.position}
        color={lightingConfig.fillLight.color}
        intensity={lightingConfig.fillLight.intensity}
      />

      {/* Rim light — cool back-light for edge definition */}
      <directionalLight
        position={lightingConfig.rimLight.position}
        color={lightingConfig.rimLight.color}
        intensity={lightingConfig.rimLight.intensity}
      />

      {/* Front fill — prevents tiles facing camera from looking black */}
      <directionalLight
        position={lightingConfig.frontFill.position}
        color={lightingConfig.frontFill.color}
        intensity={lightingConfig.frontFill.intensity}
      />

      {/* Ambient — base illumination so dark tiles aren't pitch black */}
      <ambientLight
        color={lightingConfig.ambient.color}
        intensity={lightingConfig.ambient.intensity}
      />

      {/* Hemisphere — sky warmth + ground darkness */}
      <hemisphereLight
        args={[
          lightingConfig.hemisphere.skyColor,
          lightingConfig.hemisphere.groundColor,
          lightingConfig.hemisphere.intensity,
        ]}
      />

      {/* Board glow — warm gold above board, pulsing */}
      <pointLight
        ref={boardGlowRef}
        position={lightingConfig.boardGlow.position}
        color={lightingConfig.boardGlow.color}
        distance={lightingConfig.boardGlow.distance}
        decay={lightingConfig.boardGlow.decay}
      />

      {/* Corner accent lights — colored glow at board corners */}
      <pointLight position={[-4.5, 1.0,  4.5]} color="#22c55e" intensity={1.2} distance={3.5} decay={2} />
      <pointLight position={[ 4.5, 1.0, -4.5]} color="#ef4444" intensity={1.2} distance={3.5} decay={2} />
      <pointLight position={[ 4.5, 1.0,  4.5]} color="#c8a028" intensity={0.8} distance={3.0} decay={2} />
      <pointLight position={[-4.5, 1.0, -4.5]} color="#22c55e" intensity={0.8} distance={3.0} decay={2} />

      {/* Under-board rim — subtle uplight for floating effect */}
      <pointLight
        position={lightingConfig.accentLight.position}
        color={lightingConfig.accentLight.color}
        intensity={lightingConfig.accentLight.intensity}
        distance={lightingConfig.accentLight.distance}
        decay={lightingConfig.accentLight.decay}
      />
    </>
  );
}
