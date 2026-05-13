'use client';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BOARD_TILES } from '@/data/boardTiles';
import { Tile } from './Tile';
import { BoardCenter } from './BoardCenter';

// ─── Board Layout Constants ───────────────────────────────────────────────────
// Total board footprint: 10 x 10 units
// Corner tiles: 1.6 × 1.6
// Regular tiles: 1.0 wide, 1.6 deep (measured from outer edge inward)
// 7 tiles per side between corners → 7 × 1.0 = 7.0 + 2 × 1.6 = 10.2 (close enough)

const BOARD_W = 10.0;
const BOARD_D = 10.0;
const BOARD_THICK = 0.12;

const CORNER = 1.6;          // corner tile side length
const TILE_W = 1.0;          // regular tile width (along board edge)
const TILE_D = 1.6;          // regular tile depth (inward from edge)

// Materials
const boardBodyMat = new THREE.MeshStandardMaterial({
  color: '#09070a',
  metalness: 0.08,
  roughness: 0.88,
});

const goldFrameMat = new THREE.MeshStandardMaterial({
  color: '#c8a028',
  metalness: 0.96,
  roughness: 0.12,
  emissive: '#7a5a00',
  emissiveIntensity: 0.22,
});

const goldFrameDarkMat = new THREE.MeshStandardMaterial({
  color: '#a07820',
  metalness: 0.9,
  roughness: 0.2,
  emissive: '#5a3a00',
  emissiveIntensity: 0.1,
});

const tableMat = new THREE.MeshStandardMaterial({
  color: '#0e0b08',
  metalness: 0.05,
  roughness: 0.92,
});

const tableLeatherMat = new THREE.MeshStandardMaterial({
  color: '#181210',
  metalness: 0.02,
  roughness: 0.98,
});

// ─── Frame glow lights (one per side) ────────────────────────────────────────

function FrameGlowLights() {
  const refs = [
    useRef<THREE.PointLight>(null),
    useRef<THREE.PointLight>(null),
    useRef<THREE.PointLight>(null),
    useRef<THREE.PointLight>(null),
  ];

  const COLORS = ['#22c55e', '#ef4444', '#c8a028', '#c8a028'];
  const POSITIONS: [number, number, number][] = [
    [-5.2, 0.3, 5.2],   // start corner — green
    [5.2, 0.3, -5.2],   // go to room — red
    [5.2, 0.3, 5.2],    // rest room — gold
    [-5.2, 0.3, -5.2],  // free lounge — green
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    refs.forEach((ref, i) => {
      if (ref.current) {
        ref.current.intensity = 0.5 + Math.sin(t * 1.5 + i * 1.2) * 0.25;
      }
    });
  });

  return (
    <>
      {refs.map((ref, i) => (
        <pointLight
          key={i}
          ref={ref}
          color={COLORS[i]}
          intensity={0.5}
          distance={2.0}
          position={POSITIONS[i]}
          decay={2}
        />
      ))}
    </>
  );
}

// ─── Board outer frame (the gold border box) ─────────────────────────────────

function BoardFrame() {
  const OUTER = BOARD_W + 0.40;  // frame extends beyond tiles
  const FRAME_H = 0.18;
  const FRAME_THICK = 0.20;

  return (
    <group position={[0, 0, 0]}>
      {/* ── Main board body (black slab) ── */}
      <mesh position={[0, BOARD_THICK / 2, 0]} receiveShadow>
        <boxGeometry args={[BOARD_W, BOARD_THICK, BOARD_D]} />
        <primitive object={boardBodyMat} attach="material" />
      </mesh>

      {/* ── Outer gold frame rim (4 sides) ── */}
      {/* Top side */}
      <mesh position={[0, FRAME_H / 2, -(OUTER / 2 - FRAME_THICK / 2)]}>
        <boxGeometry args={[OUTER, FRAME_H, FRAME_THICK]} />
        <primitive object={goldFrameMat} attach="material" />
      </mesh>
      {/* Bottom side */}
      <mesh position={[0, FRAME_H / 2, OUTER / 2 - FRAME_THICK / 2]}>
        <boxGeometry args={[OUTER, FRAME_H, FRAME_THICK]} />
        <primitive object={goldFrameMat} attach="material" />
      </mesh>
      {/* Left side */}
      <mesh position={[-(OUTER / 2 - FRAME_THICK / 2), FRAME_H / 2, 0]}>
        <boxGeometry args={[FRAME_THICK, FRAME_H, OUTER - FRAME_THICK * 2]} />
        <primitive object={goldFrameMat} attach="material" />
      </mesh>
      {/* Right side */}
      <mesh position={[OUTER / 2 - FRAME_THICK / 2, FRAME_H / 2, 0]}>
        <boxGeometry args={[FRAME_THICK, FRAME_H, OUTER - FRAME_THICK * 2]} />
        <primitive object={goldFrameMat} attach="material" />
      </mesh>

      {/* ── Inner frame lip (darker gold inset) ── */}
      <mesh position={[0, BOARD_THICK + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[BOARD_W / 2 - 0.01, BOARD_W / 2 + FRAME_THICK - 0.01, 4]} />
        <primitive object={goldFrameDarkMat} attach="material" />
      </mesh>

      {/* ── Corner gold caps ── */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh
          key={i}
          position={[sx * (OUTER / 2 - FRAME_THICK / 2), FRAME_H / 2, sz * (OUTER / 2 - FRAME_THICK / 2)]}
          castShadow
        >
          <boxGeometry args={[FRAME_THICK, FRAME_H + 0.02, FRAME_THICK]} />
          <primitive object={goldFrameMat} attach="material" />
        </mesh>
      ))}

      {/* ── Thin top-edge gold bead ── */}
      <mesh position={[0, FRAME_H + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[OUTER / 2 - FRAME_THICK, OUTER / 2, 4]} />
        <meshStandardMaterial color="#e8c040" metalness={1} roughness={0.08} emissive="#c8a028" emissiveIntensity={0.3} />
      </mesh>

      {/* ── Small diamond studs at frame midpoints ── */}
      {[
        [0, -(OUTER / 2 - FRAME_THICK / 2)],
        [0,  OUTER / 2 - FRAME_THICK / 2],
        [-(OUTER / 2 - FRAME_THICK / 2), 0],
        [ OUTER / 2 - FRAME_THICK / 2, 0],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, FRAME_H + 0.01, z]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.05, 0.04, 0.05]} />
          <meshStandardMaterial color="#e8d070" metalness={1} roughness={0.05} emissive="#c8a020" emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Table surface ────────────────────────────────────────────────────────────

function Table() {
  return (
    <group>
      {/* Dark felt-like table surface */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[22, 0.3, 18]} />
        <primitive object={tableMat} attach="material" />
      </mesh>
      {/* Leather texture layer on top */}
      <mesh position={[0, -0.095, 0]} receiveShadow>
        <boxGeometry args={[22, 0.01, 18]} />
        <primitive object={tableLeatherMat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Tile layout calculator ───────────────────────────────────────────────────

interface TileLayout {
  tileId: number;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  isCorner: boolean;
}

function computeTileLayouts(): TileLayout[] {
  const layouts: TileLayout[] = [];
  const HB = BOARD_W / 2; // half-board = 5.0

  // CORNER 0 — START (bottom-left, tile index 0)
  layouts.push({
    tileId: 0,
    position: [-HB + CORNER / 2, 0, HB - CORNER / 2],
    rotation: [0, 0, 0],
    width: CORNER, height: CORNER,
    isCorner: true,
  });

  // BOTTOM ROW — tiles 1-7, z = HB - TILE_D/2, from left to right
  const bottomZ = HB - TILE_D / 2;
  const bottomStartX = -HB + CORNER + TILE_W / 2;
  for (let i = 0; i < 7; i++) {
    layouts.push({
      tileId: i + 1,
      position: [bottomStartX + i * TILE_W, 0, bottomZ],
      rotation: [0, 0, 0],
      width: TILE_W, height: TILE_D,
      isCorner: false,
    });
  }

  // CORNER 8 — REST ROOM (bottom-right)
  layouts.push({
    tileId: 8,
    position: [HB - CORNER / 2, 0, HB - CORNER / 2],
    rotation: [0, 0, 0],
    width: CORNER, height: CORNER,
    isCorner: true,
  });

  // RIGHT COLUMN — tiles 9-14, x = HB - TILE_D/2, bottom to top (z decreasing)
  const rightX = HB - TILE_D / 2;
  const rightStartZ = HB - CORNER - TILE_W / 2;
  for (let i = 0; i < 6; i++) {
    layouts.push({
      tileId: i + 9,
      position: [rightX, 0, rightStartZ - i * TILE_W],
      rotation: [0, Math.PI / 2, 0], // rotate so text faces inward
      width: TILE_W, height: TILE_D,
      isCorner: false,
    });
  }

  // CORNER 15 — GO TO ROOM (top-right)
  layouts.push({
    tileId: 15,
    position: [HB - CORNER / 2, 0, -HB + CORNER / 2],
    rotation: [0, 0, 0],
    width: CORNER, height: CORNER,
    isCorner: true,
  });

  // TOP ROW — tiles 16-22, z = -HB + TILE_D/2, right to left (x decreasing)
  const topZ = -HB + TILE_D / 2;
  const topStartX = HB - CORNER - TILE_W / 2;
  for (let i = 0; i < 7; i++) {
    layouts.push({
      tileId: i + 16,
      position: [topStartX - i * TILE_W, 0, topZ],
      rotation: [0, Math.PI, 0], // text faces inward
      width: TILE_W, height: TILE_D,
      isCorner: false,
    });
  }

  // CORNER 23 — FREE LOUNGE (top-left)
  layouts.push({
    tileId: 23,
    position: [-HB + CORNER / 2, 0, -HB + CORNER / 2],
    rotation: [0, 0, 0],
    width: CORNER, height: CORNER,
    isCorner: true,
  });

  // LEFT COLUMN — tiles 24-29, x = -HB + TILE_D/2, top to bottom (z increasing)
  const leftX = -HB + TILE_D / 2;
  const leftStartZ = -HB + CORNER + TILE_W / 2;
  for (let i = 0; i < 6; i++) {
    layouts.push({
      tileId: i + 24,
      position: [leftX, 0, leftStartZ + i * TILE_W],
      rotation: [0, -Math.PI / 2, 0], // text faces inward
      width: TILE_W, height: TILE_D,
      isCorner: false,
    });
  }

  return layouts;
}

// ─── Main Board Component ─────────────────────────────────────────────────────

export function Board() {
  const boardRef = useRef<THREE.Group>(null);
  const layouts = useMemo(() => computeTileLayouts(), []);

  // Very slow float animation (your existing behaviour)
  useFrame((state) => {
    if (!boardRef.current) return;
    const t = state.clock.getElapsedTime();
    boardRef.current.position.y = Math.sin(t * 0.4) * 0.08 + 0.15;
    boardRef.current.rotation.y = Math.sin(t * 0.12) * 0.015;
  });

  return (
    <>
      {/* Table stays static */}
      <Table />

      {/* Board floats */}
      <group ref={boardRef}>
        {/* Frame */}
        <BoardFrame />

        {/* All tiles */}
        {layouts.map((layout) => {
          const tileData = BOARD_TILES[layout.tileId];
          if (!tileData) return null;
          return (
            <Tile
              key={layout.tileId}
              tile={tileData}
              position={layout.position}
              rotation={layout.rotation}
              width={layout.width}
              height={layout.height}
              isCorner={layout.isCorner}
            />
          );
        })}

        {/* Center logo + title */}
        <BoardCenter />

        {/* Corner glow lights */}
        <FrameGlowLights />
      </group>
    </>
  );
}
