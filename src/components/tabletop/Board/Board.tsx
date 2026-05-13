import React from 'react';
import { BoardBase } from './BoardBase';
import { BoardTiles } from './BoardTiles';
import { EdgeTiles } from './EdgeTiles';
import { BoardCenterpiece } from './BoardCenterpiece';

export function Board() {
  return (
    <group position={[0, 0.25, 0]}>
      <BoardBase />
      <EdgeTiles />
      <BoardTiles />
      <BoardCenterpiece />
    </group>
  );
}
