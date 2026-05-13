import { TileSide } from '@/data/tiles';

/**
 * Edge-aware tile text orientation system.
 *
 * The board is viewed from a cinematic camera at approximately [7.5, 9, 9.5],
 * sitting at the bottom-right corner of the board diagonally.
 *
 * From this camera angle, the correct readable orientations are:
 *
 *   BOTTOM (+Z edge):  Reads straight toward camera  → no Y-rotation
 *   TOP    (-Z edge):  Same as bottom — both face the camera direction
 *   LEFT   (-X edge):  Same as right — both rotate to face the camera diagonal
 *   RIGHT  (+X edge):  Rotate 90° CW around Y
 *
 * The base rotation `[-Math.PI/2, 0, 0]` lays the text flat (from the default
 * vertical billboard). The Y-component (second element) then spins it in-plane.
 */

type EulerTuple = [number, number, number];

/** Rotation that lays text flat on the tile surface, pointed toward the board edge. */
const EDGE_TEXT_ROTATION: Record<TileSide, EulerTuple> = {
  // Camera-facing edge: reads straight toward viewer.
  bottom: [-Math.PI / 2, 0, 0],

  // Top edge: same as bottom — camera diagonal means both read the same way.
  top: [-Math.PI / 2, 0, 0],

  // Left edge: same rotation as right — both readable from the camera diagonal.
  left: [-Math.PI / 2, Math.PI / 2, 0],

  // Right edge: 90° CW Y-spin.
  right: [-Math.PI / 2, Math.PI / 2, 0],
};

/**
 * Returns the correct Euler rotation for tile label text based on board edge.
 *
 * @param side  - Which perimeter edge the tile belongs to.
 * @returns Euler angles [x, y, z] in radians, suitable for <Text rotation={...} />.
 */
export function getTextRotationForSide(side: TileSide): EulerTuple {
  return EDGE_TEXT_ROTATION[side];
}

/**
 * Returns the correct Euler rotation for a glyph/icon element on a tile.
 * Glyphs use the same in-plane orientation as labels.
 */
export function getGlyphRotationForSide(side: TileSide): EulerTuple {
  return EDGE_TEXT_ROTATION[side];
}

/**
 * Returns a Z-offset sign multiplier for subtitle / glyph positioning.
 *
 * On BOTTOM tiles, a positive Z moves toward the camera (away from center).
 * On TOP tiles, a negative Z moves toward the camera (away from center).
 * On LEFT/Right, Z and X are swapped roles — but positions are already
 * expressed in local tile space so this multiplier keeps the accent band
 * inward-facing consistently.
 */
export function getInwardSignForSide(side: TileSide): 1 | -1 {
  return side === 'bottom' || side === 'right' ? 1 : -1;
}