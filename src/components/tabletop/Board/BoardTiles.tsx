import React from 'react';
import { boardConfig } from '@/data/boardConfig';
import { TileMesh } from './TileMesh';
import { generateTilesData } from '@/data/tiles';

export function BoardTiles() {
  const { height } = boardConfig.dimensions;
  const tileHeight = boardConfig.tiles.height;
  
  const tilesData = generateTilesData();

  return (
    <group>
      {tilesData.map((tile) => (
        <TileMesh 
          key={tile.id} 
          position={[tile.x, height / 2 + tileHeight / 2, tile.z]} 
          tile={tile}
        />
      ))}
    </group>
  );
}
