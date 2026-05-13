'use client';

import { Canvas } from '@react-three/fiber';
import { Experience } from '@/components/canvas/Experience';
import { Overlay } from '@/components/ui/Overlay';
import { CinematicDock } from '@/components/ui/CinematicDock';
import * as THREE from 'three';

export default function Home() {
  return (
    <main className="root">
      <Overlay />
      {/* Single centralized control dock — replaces all scattered buttons */}
      <CinematicDock />

      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [7.5, 9, 9.5], fov: 42, near: 0.1, far: 120 }}
        gl={{
          antialias: true,
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <Experience />
      </Canvas>
    </main>
  );
}
