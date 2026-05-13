'use client';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { TileData } from '@/data/boardTiles';
import { buildLandmark } from '@/systems/tiles/landmarkGeometry';

interface TileProps {
  tile: TileData;
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number; // depth of tile (from board edge inward)
  isCorner?: boolean;
}

// ─── Materials (shared across all tiles) ─────────────────────────────────────

const boardSurfaceMat = new THREE.MeshStandardMaterial({
  color: '#080608',
  metalness: 0.1,
  roughness: 0.85,
});

const goldFrameMat = new THREE.MeshStandardMaterial({
  color: '#c8a028',
  metalness: 0.95,
  roughness: 0.15,
  emissive: '#7a5a00',
  emissiveIntensity: 0.2,
});

const chanceGlowMat = new THREE.MeshStandardMaterial({
  color: '#9b59b6',
  emissive: '#6a2fa0',
  emissiveIntensity: 0.6,
  metalness: 0.3,
  roughness: 0.5,
});

const startGlowMat = new THREE.MeshStandardMaterial({
  color: '#22c55e',
  emissive: '#15803d',
  emissiveIntensity: 0.7,
  metalness: 0.3,
  roughness: 0.5,
});

const dangerGlowMat = new THREE.MeshStandardMaterial({
  color: '#ef4444',
  emissive: '#991b1b',
  emissiveIntensity: 0.7,
  metalness: 0.3,
  roughness: 0.5,
});

const taxGlowMat = new THREE.MeshStandardMaterial({
  color: '#f59e0b',
  emissive: '#b45309',
  emissiveIntensity: 0.5,
  metalness: 0.4,
  roughness: 0.5,
});

function getAccentMat(type: TileData['type']) {
  switch (type) {
    case 'chance':        return chanceGlowMat;
    case 'start':         return startGlowMat;
    case 'corner_lounge': return startGlowMat;
    case 'corner_room':   return dangerGlowMat;
    case 'tax':           return taxGlowMat;
    default:              return goldFrameMat;
  }
}

function getGlowColor(type: TileData['type']): string {
  switch (type) {
    case 'chance':        return '#9b59b6';
    case 'start':         return '#22c55e';
    case 'corner_lounge': return '#22c55e';
    case 'corner_room':   return '#ef4444';
    case 'tax':           return '#f59e0b';
    default:              return '#c8a028';
  }
}

// ─── Tile Component ───────────────────────────────────────────────────────────

export function Tile({ tile, position, rotation = [0, 0, 0], width, height, isCorner = false }: TileProps) {
  const glowRef = useRef<THREE.PointLight>(null);
  const accentMat = getAccentMat(tile.type);
  const glowColor = getGlowColor(tile.type);

  // Build landmark geometry once
  const landmarkGroup = useMemo(() => {
    if (tile.type === 'start' || tile.type === 'corner_rest' ||
        tile.type === 'corner_room' || tile.type === 'corner_lounge') return null;
    return buildLandmark(tile.landmark);
  }, [tile.landmark, tile.type]);

  // Pulsing glow for accent tiles
  useFrame((state) => {
    if (!glowRef.current) return;
    const t = state.clock.getElapsedTime();
    const base = tile.type === 'city' ? 0.0 : 0.6;
    const amp  = tile.type === 'city' ? 0.0 : 0.3;
    glowRef.current.intensity = base + Math.sin(t * 1.8 + tile.id * 0.7) * amp;
  });

  const BOARD_THICK = 0.12;
  const FRAME_T = 0.012; // frame strip thickness
  const SURFACE_Y = BOARD_THICK / 2 + 0.001;

  // Text content
  const mainLabel = tile.label;
  const subLabel  = tile.sublabel || '';

  // Whether to show ? for chance
  const isChance = tile.type === 'chance';
  const isStart  = tile.type === 'start';
  const isTax    = tile.type === 'tax';

  return (
    <group position={position} rotation={rotation}>

      {/* ── Tile surface panel ─────────────────────────────────── */}
      <mesh position={[0, BOARD_THICK / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[width - 0.01, BOARD_THICK, height - 0.01]} />
        <primitive object={boardSurfaceMat} attach="material" />
      </mesh>

      {/* ── Gold border frame (4 thin strips around tile edge) ── */}
      {/* Top edge strip */}
      <mesh position={[0, SURFACE_Y + FRAME_T / 2, -height / 2 + FRAME_T / 2]}>
        <boxGeometry args={[width - FRAME_T, FRAME_T, FRAME_T]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
      {/* Bottom edge */}
      <mesh position={[0, SURFACE_Y + FRAME_T / 2, height / 2 - FRAME_T / 2]}>
        <boxGeometry args={[width - FRAME_T, FRAME_T, FRAME_T]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
      {/* Left edge */}
      <mesh position={[-width / 2 + FRAME_T / 2, SURFACE_Y + FRAME_T / 2, 0]}>
        <boxGeometry args={[FRAME_T, FRAME_T, height]} />
        <primitive object={accentMat} attach="material" />
      </mesh>
      {/* Right edge */}
      <mesh position={[width / 2 - FRAME_T / 2, SURFACE_Y + FRAME_T / 2, 0]}>
        <boxGeometry args={[FRAME_T, FRAME_T, height]} />
        <primitive object={accentMat} attach="material" />
      </mesh>

      {/* ── Inner decorative border (thinner gold inset line) ── */}
      {tile.type === 'city' && (
        <>
          <mesh position={[0, SURFACE_Y + 0.003, -height / 2 + 0.06]}>
            <boxGeometry args={[width * 0.82, 0.005, 0.004]} />
            <primitive object={goldFrameMat} attach="material" />
          </mesh>
          <mesh position={[0, SURFACE_Y + 0.003, height / 2 - 0.06]}>
            <boxGeometry args={[width * 0.82, 0.005, 0.004]} />
            <primitive object={goldFrameMat} attach="material" />
          </mesh>
          <mesh position={[-width / 2 + 0.06, SURFACE_Y + 0.003, 0]}>
            <boxGeometry args={[0.004, 0.005, height * 0.82]} />
            <primitive object={goldFrameMat} attach="material" />
          </mesh>
          <mesh position={[width / 2 - 0.06, SURFACE_Y + 0.003, 0]}>
            <boxGeometry args={[0.004, 0.005, height * 0.82]} />
            <primitive object={goldFrameMat} attach="material" />
          </mesh>
        </>
      )}

      {/* ── Corner diamond ornaments ─────────────────────────── */}
      {tile.type === 'city' && (
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
          <mesh
            key={i}
            position={[sx * (width / 2 - 0.065), SURFACE_Y + 0.005, sz * (height / 2 - 0.065)]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <boxGeometry args={[0.025, 0.005, 0.025]} />
            <primitive object={goldFrameMat} attach="material" />
          </mesh>
        ))
      )}

      {/* ── Sub-label number (top of tile) ─────────────────── */}
      {subLabel && (
        <Text
          position={[0, SURFACE_Y + 0.012, -height / 2 + 0.13]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.055}
          color="#c8a028"
          font="https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gt7-GU.woff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {subLabel}
        </Text>
      )}

      {/* ── Main city name label ─────────────────────────────── */}
      <Text
        position={[0, SURFACE_Y + 0.012, isCorner ? 0 : (height / 2 - 0.14)]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={isCorner ? 0.095 : 0.068}
        color={isStart ? '#22c55e' : tile.type === 'corner_room' ? '#ef4444' : '#e8d090'}
        font="https://fonts.gstatic.com/s/cinzel/v23/8vIJ7ww63mVu7gt7-GU.woff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        maxWidth={width * 0.85}
        textAlign="center"
      >
        {mainLabel}
      </Text>

      {/* ── Chance "?" glyph ─────────────────────────────────── */}
      {isChance && (
        <Text
          position={[0, SURFACE_Y + 0.015, 0.0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.22}
          color="#9b59b6"
          anchorX="center"
          anchorY="middle"
        >
          ?
        </Text>
      )}

      {/* ── Start arrows ─────────────────────────────────────── */}
      {isStart && (
        <Text
          position={[0, SURFACE_Y + 0.015, 0.15]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.14}
          color="#22c55e"
          anchorX="center"
          anchorY="middle"
        >
          ← ← ←
        </Text>
      )}

      {/* ── Tax icon ─────────────────────────────────────────── */}
      {isTax && (
        <Text
          position={[0, SURFACE_Y + 0.015, 0.05]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.12}
          color="#f59e0b"
          anchorX="center"
          anchorY="middle"
        >
          🏛
        </Text>
      )}

      {/* ── 3D Landmark geometry (city tiles) ────────────────── */}
      {landmarkGroup && (
        <primitive
          object={landmarkGroup}
          position={[0, SURFACE_Y, isCorner ? 0 : -0.05]}
          scale={[0.72, 0.72, 0.72]}
        />
      )}

      {/* ── Accent point light for glowing tiles ─────────────── */}
      {tile.type !== 'city' && (
        <pointLight
          ref={glowRef}
          color={glowColor}
          intensity={0.6}
          distance={1.2}
          position={[0, 0.5, 0]}
          decay={2}
        />
      )}

      {/* ── Corner diamond dot (decorative) ──────────────────── */}
      <mesh position={[0, SURFACE_Y + 0.006, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.018, 0.004, 0.018]} />
        <primitive object={goldFrameMat} attach="material" />
      </mesh>
    </group>
  );
}
