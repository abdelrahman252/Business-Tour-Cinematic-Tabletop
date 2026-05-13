import { boardConfig } from '@/data/boardConfig';
import { FINAL_BOARD_SPACES, getTileGridPosition, getTileWorldPosition } from '@/data/tiles';

export interface BoardNode {
  id: number;
  tileIndex: number;
  tileId: string;
  label: string;
  position: [number, number, number];
  direction: "UP" | "DOWN" | "LEFT" | "RIGHT";
  isCorner?: boolean;
}

export function createBoardPath(): BoardNode[] {
  const { height } = boardConfig.dimensions;
  const tileHeight = boardConfig.tiles.height;
  
  // The y-coordinate is the top surface of the tile
  const y = height / 2 + tileHeight;

  return FINAL_BOARD_SPACES.map((space) => {
    const [x, , z] = getTileWorldPosition(space.index);
    const { direction } = getTileGridPosition(space.index);

    return {
      id: space.index,
      tileIndex: space.index,
      tileId: space.id,
      label: space.label,
      position: [x, y, z],
      direction,
      isCorner: space.kind === 'corner',
    };
  });
}
