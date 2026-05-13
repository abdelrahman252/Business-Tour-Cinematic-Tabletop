import { boardConfig } from './boardConfig';
import { colors } from './colors';

export type TileKind = 'property' | 'premium' | 'chance' | 'tax' | 'corner';
export type TileSide = 'bottom' | 'left' | 'top' | 'right';
export type TileDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface TileData {
  id: string;
  index: number;
  label: string;
  subtitle?: string;
  x: number;
  z: number;
  grid: [number, number];
  side: TileSide;
  direction: TileDirection;
  kind: TileKind;
  groupId?: number;
  isCorner: boolean;
  isEdge: boolean;
  isPremium?: boolean;
  accentColor: number;
  baseColor: number;
  ownerColor?: number | null;
  ownerGlow?: number;
}

export interface MonopolyGroup {
  id: number;
  name: string;
  color: number;
  tiles: string[];
}

export const MONOPOLY_GROUPS: MonopolyGroup[] = [
  { id: 1, name: 'Founders Row', color: colors.board.groups[0], tiles: ['Granada', 'Seattle', 'Madrid'] },
  { id: 2, name: 'Pacific Trade', color: colors.board.groups[1], tiles: ['Hong Kong', 'Beijing', 'Shanghai'] },
  { id: 3, name: 'Italian Atelier', color: colors.board.groups[2], tiles: ['Venice', 'Milan', 'Rome'] },
  { id: 4, name: 'Industrial North', color: colors.board.groups[3], tiles: ['Hamburg', 'Berlin'] },
  { id: 5, name: 'Commonwealth Core', color: colors.board.groups[4], tiles: ['London', 'Sydney'] },
  { id: 6, name: 'American Prime', color: colors.board.groups[5], tiles: ['Chicago', 'Las Vegas', 'New York'] },
  { id: 7, name: 'Riviera Line', color: colors.board.groups[6], tiles: ['Lyon', 'Paris'] },
  { id: 8, name: 'Eastern Crown', color: colors.board.groups[7], tiles: ['Kazan', 'Moscow'] },
];

type BoardSpaceDefinition = Omit<TileData, 'x' | 'z' | 'grid' | 'side' | 'direction' | 'isCorner' | 'isEdge' | 'accentColor' | 'baseColor'> & {
  accentColor?: number;
  baseColor?: number;
};

const groupColor = (groupId: number) => MONOPOLY_GROUPS[groupId - 1].color;

export const FINAL_BOARD_SPACES: BoardSpaceDefinition[] = [
  { id: 'start', index: 0, label: 'START', subtitle: 'Begin', kind: 'corner', accentColor: colors.board.start },

  { id: 'granada', index: 1, label: 'Granada', subtitle: 'G1', kind: 'property', groupId: 1 },
  { id: 'seattle', index: 2, label: 'Seattle', subtitle: 'G1', kind: 'property', groupId: 1 },
  { id: 'madrid', index: 3, label: 'Madrid', subtitle: 'G1', kind: 'property', groupId: 1 },
  { id: 'maldives', index: 4, label: 'Maldives', subtitle: 'Island', kind: 'premium', isPremium: true },
  { id: 'hong-kong', index: 5, label: 'Hong Kong', subtitle: 'G2', kind: 'property', groupId: 2 },
  { id: 'beijing', index: 6, label: 'Beijing', subtitle: 'G2', kind: 'property', groupId: 2 },
  { id: 'shanghai', index: 7, label: 'Shanghai', subtitle: 'G2', kind: 'property', groupId: 2 },

  { id: 'rat-room', index: 8, label: 'RAT ROOM', subtitle: 'Jail', kind: 'corner', accentColor: colors.board.warning },

  { id: 'venice', index: 9, label: 'Venice', subtitle: 'G3', kind: 'property', groupId: 3 },
  { id: 'milan', index: 10, label: 'Milan', subtitle: 'G3', kind: 'property', groupId: 3 },
  { id: 'rome', index: 11, label: 'Rome', subtitle: 'G3', kind: 'property', groupId: 3 },
  { id: 'chance-1', index: 12, label: 'Chance', subtitle: 'Card', kind: 'chance' },
  { id: 'hamburg', index: 13, label: 'Hamburg', subtitle: 'G4', kind: 'property', groupId: 4 },
  { id: 'cyprus', index: 14, label: 'Cyprus', subtitle: 'Island', kind: 'premium', isPremium: true },
  { id: 'berlin', index: 15, label: 'Berlin', subtitle: 'G4', kind: 'property', groupId: 4 },

  { id: 'free-lounge', index: 16, label: 'FREE LOUNGE', subtitle: 'Rest', kind: 'corner', accentColor: colors.board.start },

  { id: 'london', index: 17, label: 'London', subtitle: 'G5', kind: 'property', groupId: 5 },
  { id: 'sochi', index: 18, label: 'Sochi', subtitle: 'Island', kind: 'premium', isPremium: true },
  { id: 'sydney', index: 19, label: 'Sydney', subtitle: 'G5', kind: 'property', groupId: 5 },
  { id: 'chance-2', index: 20, label: 'Chance', subtitle: 'Card', kind: 'chance' },
  { id: 'chicago', index: 21, label: 'Chicago', subtitle: 'G6', kind: 'property', groupId: 6 },
  { id: 'las-vegas', index: 22, label: 'Las Vegas', subtitle: 'G6', kind: 'property', groupId: 6 },
  { id: 'new-york', index: 23, label: 'New York', subtitle: 'G6', kind: 'property', groupId: 6 },

  { id: 'go-to-rat-room', index: 24, label: 'GO TO RAT ROOM', subtitle: 'Move', kind: 'corner', accentColor: colors.board.warning },

  { id: 'nice', index: 25, label: 'Nice', subtitle: 'Island', kind: 'premium', isPremium: true },
  { id: 'lyon', index: 26, label: 'Lyon', subtitle: 'G7', kind: 'property', groupId: 7 },
  { id: 'paris', index: 27, label: 'Paris', subtitle: 'G7', kind: 'property', groupId: 7 },
  { id: 'chance-3', index: 28, label: 'Chance', subtitle: 'Card', kind: 'chance' },
  { id: 'kazan', index: 29, label: 'Kazan', subtitle: 'G8', kind: 'property', groupId: 8 },
  { id: 'tax', index: 30, label: 'Tax', subtitle: 'Ledger', kind: 'tax' },
  { id: 'moscow', index: 31, label: 'Moscow', subtitle: 'G8', kind: 'property', groupId: 8 },
];

function resolveTileColors(space: BoardSpaceDefinition) {
  if (space.groupId) {
    return {
      accentColor: groupColor(space.groupId),
      baseColor: colors.board.tileBase,
    };
  }

  if (space.kind === 'premium') {
    return {
      accentColor: colors.board.premium,
      baseColor: colors.board.tilePremium,
    };
  }

  if (space.kind === 'chance') {
    return {
      accentColor: colors.board.chance,
      baseColor: colors.board.tileSpecial,
    };
  }

  if (space.kind === 'tax') {
    return {
      accentColor: colors.board.tax,
      baseColor: colors.board.tileSpecial,
    };
  }

  return {
    accentColor: space.accentColor ?? colors.board.frame,
    baseColor: colors.board.tileCorner,
  };
}

export function getTileGridPosition(index: number): { grid: [number, number]; side: TileSide; direction: TileDirection } {
  const cellCount = boardConfig.grid.lineCount;
  const last = cellCount - 1;

  if (index <= last) {
    return { grid: [last - index, last], side: 'bottom', direction: 'LEFT' };
  }

  if (index <= last * 2) {
    const progress = index - last;
    return { grid: [0, last - progress], side: 'left', direction: 'UP' };
  }

  if (index <= last * 3) {
    const progress = index - last * 2;
    return { grid: [progress, 0], side: 'top', direction: 'RIGHT' };
  }

  const progress = index - last * 3;
  return { grid: [last, progress], side: 'right', direction: 'DOWN' };
}

export function getTileWorldPosition(index: number): [number, number, number] {
  const { width, depth } = boardConfig.dimensions;
  const { thickness } = boardConfig.frame;
  const cellCount = boardConfig.grid.lineCount;
  const cellSize = (width - thickness * 2) / cellCount;
  const { grid } = getTileGridPosition(index);

  const x = -width / 2 + thickness + (grid[0] + 0.5) * cellSize;
  const z = -depth / 2 + thickness + (grid[1] + 0.5) * cellSize;

  return [x, 0, z];
}

export function generateTilesData(): TileData[] {
  const lastIndex = boardConfig.grid.lineCount * 4 - 5;

  return FINAL_BOARD_SPACES.map((space) => {
    if (space.index > lastIndex) {
      throw new Error(`Tile ${space.label} exceeds the configured board perimeter.`);
    }

    const { grid, side, direction } = getTileGridPosition(space.index);
    const [x, , z] = getTileWorldPosition(space.index);
    const colorsForTile = resolveTileColors(space);
    const isCorner = space.kind === 'corner';

    return {
      ...space,
      ...colorsForTile,
      x,
      z,
      grid,
      side,
      direction,
      isCorner,
      isEdge: !isCorner,
      ownerColor: space.ownerColor ?? null,
      ownerGlow: space.ownerGlow ?? 0,
    };
  });
}
