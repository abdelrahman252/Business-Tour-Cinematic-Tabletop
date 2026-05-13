import * as THREE from 'three';

export interface BoardNode {
  position: THREE.Vector3;
  tileIndex: number;
}

// Board sits centered at origin. Total outer size = 10 x 10 units.
// Corner tiles are 1.6 x 1.6. Regular tiles are 1.0 wide, 1.6 deep.
// Pawn walks along the center of the tile path at y = 0.08 (just above board surface).

const Y = 0.08;

// Half-extent of the full board
const HALF = 5.0;

// Corner tile center offset from edge
const CORNER_HALF = 0.8; // corner tiles are 1.6 wide, center at 0.8 from edge

// Regular tile width
const TILE_W = 1.0;

// Starting x for bottom row (after left corner)
// Left corner center: -HALF + CORNER_HALF = -4.2
// First regular tile starts at -4.2 + 0.8 + 0.5 = -3.9  (edge of corner + half tile)
// Bottom row goes left→right: tiles 1-7

function buildPath(): BoardNode[] {
  const nodes: BoardNode[] = [];

  // CORNER 0 — START (bottom-left)
  nodes.push({ tileIndex: 0, position: new THREE.Vector3(-HALF + CORNER_HALF, Y, HALF - CORNER_HALF) });

  // BOTTOM ROW — tiles 1-7 (left → right), z = HALF - CORNER_HALF (same as start)
  const bottomZ = HALF - CORNER_HALF;
  const bottomRowStartX = -HALF + CORNER_HALF * 2 + TILE_W * 0.5;
  for (let i = 0; i < 7; i++) {
    nodes.push({
      tileIndex: i + 1,
      position: new THREE.Vector3(bottomRowStartX + i * TILE_W, Y, bottomZ),
    });
  }

  // CORNER 8 — REST ROOM (bottom-right)
  nodes.push({ tileIndex: 8, position: new THREE.Vector3(HALF - CORNER_HALF, Y, HALF - CORNER_HALF) });

  // RIGHT COLUMN — tiles 9-14 (bottom → top), x = HALF - CORNER_HALF
  const rightX = HALF - CORNER_HALF;
  const rightColStartZ = HALF - CORNER_HALF * 2 - TILE_W * 0.5;
  for (let i = 0; i < 6; i++) {
    nodes.push({
      tileIndex: i + 9,
      position: new THREE.Vector3(rightX, Y, rightColStartZ - i * TILE_W),
    });
  }

  // CORNER 15 — GO TO ROOM (top-right)
  nodes.push({ tileIndex: 15, position: new THREE.Vector3(HALF - CORNER_HALF, Y, -HALF + CORNER_HALF) });

  // TOP ROW — tiles 16-22 (right → left), z = -HALF + CORNER_HALF
  const topZ = -HALF + CORNER_HALF;
  const topRowStartX = HALF - CORNER_HALF * 2 - TILE_W * 0.5;
  for (let i = 0; i < 7; i++) {
    nodes.push({
      tileIndex: i + 16,
      position: new THREE.Vector3(topRowStartX - i * TILE_W, Y, topZ),
    });
  }

  // CORNER 23 — FREE LOUNGE (top-left)
  nodes.push({ tileIndex: 23, position: new THREE.Vector3(-HALF + CORNER_HALF, Y, -HALF + CORNER_HALF) });

  // LEFT COLUMN — tiles 24-29 (top → bottom), x = -HALF + CORNER_HALF
  const leftX = -HALF + CORNER_HALF;
  const leftColStartZ = -HALF + CORNER_HALF * 2 + TILE_W * 0.5;
  for (let i = 0; i < 6; i++) {
    nodes.push({
      tileIndex: i + 24,
      position: new THREE.Vector3(leftX, Y, leftColStartZ + i * TILE_W),
    });
  }

  return nodes;
}

export function createBoardPath(): BoardNode[] {
  return buildPath();
}
