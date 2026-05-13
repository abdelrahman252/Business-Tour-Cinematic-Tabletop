/**
 * BUSINESS TOUR — PREMIUM EDITION
 * Tile Data v2 — Board Space Definitions
 *
 * Each space carries:
 *   - Positioning data (index, grid, side, direction)
 *   - Material data (baseColor, accentColor)
 *   - Identity data (label, subtitle, kind, groupId)
 *   - Ownership data (ownerColor, ownerGlow)
 *
 * Subtitles are redesigned as elegant category descriptors — not raw IDs.
 */

import { boardConfig } from './boardConfig';
import { colors }      from './colors';

export type TileKind      = 'property' | 'premium' | 'chance' | 'tax' | 'corner';
export type TileSide      = 'bottom' | 'left' | 'top' | 'right';
export type TileDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TileData {
  id:          string;
  index:       number;
  label:       string;
  subtitle?:   string;
  x:           number;
  z:           number;
  grid:        [number, number];
  side:        TileSide;
  direction:   TileDirection;
  kind:        TileKind;
  groupId?:    number;
  isCorner:    boolean;
  isEdge:      boolean;
  isPremium?:  boolean;
  accentColor: number;
  baseColor:   number;
  ownerColor?: number | null;
  ownerGlow?:  number;
}

export interface MonopolyGroup {
  id:    number;
  name:  string;
  color: number;
  tiles: string[];
}

export const MONOPOLY_GROUPS: MonopolyGroup[] = [
  { id: 1, name: 'Founders Row',     color: colors.board.groups[0], tiles: ['Granada', 'Seattle', 'Madrid'] },
  { id: 2, name: 'Pacific Trade',    color: colors.board.groups[1], tiles: ['Hong Kong', 'Beijing', 'Shanghai'] },
  { id: 3, name: 'Italian Atelier',  color: colors.board.groups[2], tiles: ['Venice', 'Milan', 'Rome'] },
  { id: 4, name: 'Industrial North', color: colors.board.groups[3], tiles: ['Hamburg', 'Berlin'] },
  { id: 5, name: 'Commonwealth',     color: colors.board.groups[4], tiles: ['London', 'Sydney'] },
  { id: 6, name: 'American Prime',   color: colors.board.groups[5], tiles: ['Chicago', 'Las Vegas', 'New York'] },
  { id: 7, name: 'Riviera Line',     color: colors.board.groups[6], tiles: ['Lyon', 'Paris'] },
  { id: 8, name: 'Eastern Crown',    color: colors.board.groups[7], tiles: ['Kazan', 'Moscow'] },
];

type BoardSpaceDefinition = Omit<TileData, 'x' | 'z' | 'grid' | 'side' | 'direction' | 'isCorner' | 'isEdge' | 'accentColor' | 'baseColor'> & {
  accentColor?: number;
  baseColor?:   number;
};

const groupColor = (groupId: number) => MONOPOLY_GROUPS[groupId - 1].color;

export const FINAL_BOARD_SPACES: BoardSpaceDefinition[] = [
  // ── Corner tiles ──────────────────────────────────────────────────────────
  { id: 'start',           index: 0,  label: 'START',         subtitle: 'Collect',  kind: 'corner',   accentColor: colors.board.start   },

  // ── Left edge (bottom→top) ────────────────────────────────────────────────
  { id: 'granada',         index: 1,  label: 'Granada',       subtitle: 'Founders', kind: 'property', groupId: 1 },
  { id: 'seattle',         index: 2,  label: 'Seattle',       subtitle: 'Founders', kind: 'property', groupId: 1 },
  { id: 'madrid',          index: 3,  label: 'Madrid',        subtitle: 'Founders', kind: 'property', groupId: 1 },
  { id: 'maldives',        index: 4,  label: 'Maldives',      subtitle: 'Island',   kind: 'premium',  isPremium: true },
  { id: 'hong-kong',       index: 5,  label: 'Hong Kong',     subtitle: 'Pacific',  kind: 'property', groupId: 2 },
  { id: 'beijing',         index: 6,  label: 'Beijing',       subtitle: 'Pacific',  kind: 'property', groupId: 2 },
  { id: 'shanghai',        index: 7,  label: 'Shanghai',      subtitle: 'Pacific',  kind: 'property', groupId: 2 },

  { id: 'rat-room',        index: 8,  label: 'RAT ROOM',      subtitle: 'Detained', kind: 'corner',   accentColor: colors.board.warning },

  // ── Top edge ──────────────────────────────────────────────────────────────
  { id: 'venice',          index: 9,  label: 'Venice',        subtitle: 'Atelier',  kind: 'property', groupId: 3 },
  { id: 'milan',           index: 10, label: 'Milan',         subtitle: 'Atelier',  kind: 'property', groupId: 3 },
  { id: 'rome',            index: 11, label: 'Rome',          subtitle: 'Atelier',  kind: 'property', groupId: 3 },
  { id: 'chance-1',        index: 12, label: 'Chance',        subtitle: 'Draw',     kind: 'chance'    },
  { id: 'hamburg',         index: 13, label: 'Hamburg',       subtitle: 'Industrial',kind: 'property', groupId: 4 },
  { id: 'cyprus',          index: 14, label: 'Cyprus',        subtitle: 'Island',   kind: 'premium',  isPremium: true },
  { id: 'berlin',          index: 15, label: 'Berlin',        subtitle: 'Industrial',kind: 'property', groupId: 4 },

  { id: 'free-lounge',     index: 16, label: 'FREE\nLOUNGE',  subtitle: 'Rest',     kind: 'corner',   accentColor: colors.board.start   },

  // ── Right edge ────────────────────────────────────────────────────────────
  { id: 'london',          index: 17, label: 'London',        subtitle: 'Commonwealth', kind: 'property', groupId: 5 },
  { id: 'sochi',           index: 18, label: 'Sochi',         subtitle: 'Resort',   kind: 'premium',  isPremium: true },
  { id: 'sydney',          index: 19, label: 'Sydney',        subtitle: 'Commonwealth', kind: 'property', groupId: 5 },
  { id: 'chance-2',        index: 20, label: 'Chance',        subtitle: 'Draw',     kind: 'chance'    },
  { id: 'chicago',         index: 21, label: 'Chicago',       subtitle: 'American', kind: 'property', groupId: 6 },
  { id: 'las-vegas',       index: 22, label: 'Las Vegas',     subtitle: 'American', kind: 'property', groupId: 6 },
  { id: 'new-york',        index: 23, label: 'New York',      subtitle: 'American', kind: 'property', groupId: 6 },

  { id: 'go-to-rat-room',  index: 24, label: 'GO TO\nRAT ROOM', subtitle: 'Penalized', kind: 'corner', accentColor: colors.board.warning },

  // ── Bottom edge (right→left) ──────────────────────────────────────────────
  { id: 'nice',            index: 25, label: 'Nice',          subtitle: 'Resort',   kind: 'premium',  isPremium: true },
  { id: 'lyon',            index: 26, label: 'Lyon',          subtitle: 'Riviera',  kind: 'property', groupId: 7 },
  { id: 'paris',           index: 27, label: 'Paris',         subtitle: 'Riviera',  kind: 'property', groupId: 7 },
  { id: 'chance-3',        index: 28, label: 'Chance',        subtitle: 'Draw',     kind: 'chance'    },
  { id: 'kazan',           index: 29, label: 'Kazan',         subtitle: 'Eastern',  kind: 'property', groupId: 8 },
  { id: 'tax',             index: 30, label: 'Tax',           subtitle: 'Ledger',   kind: 'tax'       },
  { id: 'moscow',          index: 31, label: 'Moscow',        subtitle: 'Eastern',  kind: 'property', groupId: 8 },
];

// ─── Color resolution ─────────────────────────────────────────────────────────

function resolveTileColors(space: BoardSpaceDefinition) {
  if (space.groupId) {
    return {
      accentColor: groupColor(space.groupId),
      baseColor:   colors.board.tileBase,
    };
  }

  if (space.kind === 'premium') {
    return {
      accentColor: colors.board.premium,
      baseColor:   colors.board.tilePremium,
    };
  }

  if (space.kind === 'chance') {
    return {
      accentColor: colors.board.chance,
      baseColor:   colors.board.tileSpecial,
    };
  }

  if (space.kind === 'tax') {
    return {
      accentColor: colors.board.tax,
      baseColor:   colors.board.tileSpecial,
    };
  }

  return {
    accentColor: space.accentColor ?? colors.board.frame,
    baseColor:   colors.board.tileCorner,
  };
}

// ─── Grid position helpers ────────────────────────────────────────────────────

export function getTileGridPosition(index: number): { grid: [number, number]; side: TileSide; direction: TileDirection } {
  const cellCount = boardConfig.grid.lineCount;
  const last      = cellCount - 1;

  if (index <= last) {
    return { grid: [last - index, last], side: 'bottom',  direction: 'LEFT'  };
  }
  if (index <= last * 2) {
    const progress = index - last;
    return { grid: [0, last - progress], side: 'left',    direction: 'UP'    };
  }
  if (index <= last * 3) {
    const progress = index - last * 2;
    return { grid: [progress, 0],        side: 'top',     direction: 'RIGHT' };
  }
  const progress = index - last * 3;
  return { grid: [last, progress],       side: 'right',   direction: 'DOWN'  };
}

export function getTileWorldPosition(index: number): [number, number, number] {
  const { width, depth } = boardConfig.dimensions;
  const { thickness }    = boardConfig.frame;
  const cellCount        = boardConfig.grid.lineCount;
  const cellSize         = (width - thickness * 2) / cellCount;
  const { grid, side }   = getTileGridPosition(index);

  const basX = -width / 2 + thickness + (grid[0] + 0.5) * cellSize;
  const basZ = -depth / 2 + thickness + (grid[1] + 0.5) * cellSize;

  // Corners stay at natural grid center
  const isCorner = (index === 0) || (index === cellCount - 1) ||
                   (index === (cellCount - 1) * 2) || (index === (cellCount - 1) * 3);
  if (isCorner) return [basX, 0, basZ];

  // Portrait tiles: shift center inward so outer face sits flush at frame inner edge
  const tiles      = (boardConfig.tiles as any);
  const ratio      = tiles.portraitRatio ?? 1.55;
  const margin     = tiles.margin        ?? 0.028;
  const tileW      = cellSize - margin;
  const tileD      = tileW * ratio;
  const frameInner = width / 2 - thickness;

  let x = basX, z = basZ;
  if (side === 'bottom') {
    z = basZ - (basZ + tileD / 2 - frameInner);
  } else if (side === 'top') {
    z = basZ + (-basZ + tileD / 2 - frameInner);
  } else if (side === 'right') {
    x = basX - (basX + tileD / 2 - frameInner);
  } else if (side === 'left') {
    x = basX + (-basX + tileD / 2 - frameInner);
  }

  return [x, 0, z];
}

export function generateTilesData(): TileData[] {
  const lastIndex = boardConfig.grid.lineCount * 4 - 5;

  return FINAL_BOARD_SPACES.map((space) => {
    if (space.index > lastIndex) {
      throw new Error(`Tile "${space.label}" (index ${space.index}) exceeds the configured board perimeter (max ${lastIndex}).`);
    }

    const { grid, side, direction } = getTileGridPosition(space.index);
    const [x, , z]                  = getTileWorldPosition(space.index);
    const colorsForTile             = resolveTileColors(space);
    const isCorner                  = space.kind === 'corner';

    return {
      ...space,
      ...colorsForTile,
      x,
      z,
      grid,
      side,
      direction,
      isCorner,
      isEdge:     !isCorner,
      ownerColor: space.ownerColor ?? null,
      ownerGlow:  space.ownerGlow  ?? 0,
    };
  });
}
