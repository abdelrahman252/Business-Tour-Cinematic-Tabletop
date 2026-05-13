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
      {/* Warm key light from upper-left */}
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

      {/* Warm fill from right */}
      <directionalLight 
        position={lightingConfig.fillLight.position} 
        color={lightingConfig.fillLight.color} 
        intensity={lightingConfig.fillLight.intensity} 
      />

      {/* Cool blue rim from back */}
      <directionalLight 
        position={lightingConfig.rimLight.position} 
        color={lightingConfig.rimLight.color} 
        intensity={lightingConfig.rimLight.intensity} 
      />

      {/* Ambient */}
      <ambientLight 
        color={lightingConfig.ambient.color} 
        intensity={lightingConfig.ambient.intensity} 
      />

      {/* Hemisphere sky/ground */}
      <hemisphereLight 
        args={[
          lightingConfig.hemisphere.skyColor, 
          lightingConfig.hemisphere.groundColor, 
          lightingConfig.hemisphere.intensity
        ]} 
      />

      {/* Point light above board — warm glow */}
      <pointLight 
        ref={boardGlowRef} 
        position={lightingConfig.boardGlow.position} 
        color={lightingConfig.boardGlow.color} 
        distance={lightingConfig.boardGlow.distance} 
        decay={lightingConfig.boardGlow.decay} 
      />

      {/* Secondary point behind board — accent */}
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
