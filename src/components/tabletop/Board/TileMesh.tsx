import React from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { boardConfig } from '@/data/boardConfig';
import { colors } from '@/data/colors';
import { TileData, TileSide } from '@/data/tiles';

interface TileMeshProps {
  position: [number, number, number];
  tile: TileData;
}

// Top  = same as bottom (both face camera straight)
// Left = same as right  (both face camera from the side)
const TEXT_ROTATION: Record<TileSide, [number, number, number]> = {
  bottom: [-Math.PI / 2, 0, 0],
  top:    [-Math.PI / 2, 0, 0],
  left:   [-Math.PI / 2, 0, Math.PI / 2],
  right:  [-Math.PI / 2, 0, Math.PI / 2],
};

// Glyph offset: always push toward the outer edge of the tile
// bottom/top → offset on Z, left/right → offset on X
function getGlyphPosition(side: TileSide, tileSize: number): [number, number, number] {
  const d = tileSize * 0.16;
  if (side === 'bottom' || side === 'top') return [0, 0.051, d];
  return [d, 0.051, 0];
}

// Subtitle offset: push toward inner edge (opposite of accent band)
// bottom/top → offset on Z, left/right → offset on X
function getSubtitlePosition(side: TileSide, tileSize: number, isCorner: boolean): [number, number, number] {
  const d = isCorner ? tileSize * 0.32 : tileSize * 0.31;
  const y = boardConfig.tiles.height / 2 + 0.064;
  if (side === 'bottom' || side === 'top') return [0, y, -d];
  return [-d, y, 0];
}

// Label position: centered on tile
function getLabelPosition(side: TileSide, tileSize: number, isCorner: boolean): [number, number, number] {
  const y = boardConfig.tiles.height / 2 + 0.062;
  const inset = isCorner ? tileSize * 0.04 : 0;
  if (side === 'bottom' || side === 'top') return [0, y, -inset];
  return [-inset, y, 0];
}

function getLabelSize(label: string, isCorner: boolean) {
  if (isCorner) return label.length > 10 ? 0.17 : 0.2;
  if (label.length > 8) return 0.15;
  return 0.17;
}

function getBandPlacement(side: TileSide, tileSize: number) {
  const offset = tileSize * 0.3;
  const long = tileSize * 0.82;
  const short = boardConfig.tiles.accentDepth;

  if (side === 'bottom') return { args: [long, boardConfig.tiles.accentHeight, short] as [number, number, number], position: [0, 0.023, offset] as [number, number, number] };
  if (side === 'top')    return { args: [long, boardConfig.tiles.accentHeight, short] as [number, number, number], position: [0, 0.023, -offset] as [number, number, number] };
  if (side === 'left')   return { args: [short, boardConfig.tiles.accentHeight, long] as [number, number, number], position: [-offset, 0.023, 0] as [number, number, number] };
  return                        { args: [short, boardConfig.tiles.accentHeight, long] as [number, number, number], position: [offset, 0.023, 0] as [number, number, number] };
}

function getOwnerBandPlacement(side: TileSide, tileSize: number) {
  const offset = tileSize * 0.39;
  const long = tileSize * 0.74;
  const short = boardConfig.tiles.ownershipDepth;

  if (side === 'bottom') return { args: [long, 0.008, short] as [number, number, number], position: [0, 0.03, -offset] as [number, number, number] };
  if (side === 'top')    return { args: [long, 0.008, short] as [number, number, number], position: [0, 0.03, offset] as [number, number, number] };
  if (side === 'left')   return { args: [short, 0.008, long] as [number, number, number], position: [offset, 0.03, 0] as [number, number, number] };
  return                        { args: [short, 0.008, long] as [number, number, number], position: [-offset, 0.03, 0] as [number, number, number] };
}

function TileGlyph({ tile, tileSize }: { tile: TileData; tileSize: number }) {
  if (tile.kind === 'property') return null;

  const glyph = tile.kind === 'premium' ? 'I' : tile.kind === 'chance' ? '?' : tile.kind === 'tax' ? '$' : '.';
  const size = tile.kind === 'corner' ? 0.11 : 0.13;
  const pos = getGlyphPosition(tile.side, tileSize);

  return (
    <Text
      position={pos}
      rotation={TEXT_ROTATION[tile.side]}
      fontSize={size}
      color={tile.accentColor}
      anchorX="center"
      anchorY="middle"
      outlineColor={0x150f08}
      outlineWidth={0.006}
      material-side={THREE.DoubleSide}
      material-toneMapped={false}
    >
      {glyph}
    </Text>
  );
}

export function TileMesh({ position, tile }: TileMeshProps) {
  const { width } = boardConfig.dimensions;
  const { thickness } = boardConfig.frame;
  const cellCount = boardConfig.grid.lineCount;
  const cellSize = (width - thickness * 2) / cellCount;
  const { height, margin, topInset } = boardConfig.tiles;
  const tileSize = cellSize - margin;
  const insetSize = tileSize - topInset;
  const accent = getBandPlacement(tile.side, tileSize);
  const owner = getOwnerBandPlacement(tile.side, tileSize);
  const ownerColor = tile.ownerColor ?? colors.board.ownershipEmpty;
  const isSpecial = tile.kind === 'chance' || tile.kind === 'tax';
  const label = tile.label.replaceAll(' ', '\n');

  const rotation = TEXT_ROTATION[tile.side];
  const labelPos = getLabelPosition(tile.side, tileSize, tile.isCorner);
  const subtitlePos = getSubtitlePosition(tile.side, tileSize, tile.isCorner);

  return (
    <group position={position}>
      <RoundedBox args={[tileSize, height, tileSize]} radius={0.035} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color={tile.baseColor} roughness={0.42} metalness={0.16} envMapIntensity={0.65} />
      </RoundedBox>

      <mesh position={[0, height / 2 + 0.003, 0]} receiveShadow>
        <boxGeometry args={[insetSize, 0.008, insetSize]} />
        <meshStandardMaterial
          color={tile.isCorner ? colors.board.tileCorner : isSpecial ? colors.board.tileSpecial : colors.board.tileInset}
          roughness={0.38}
          metalness={0.08}
        />
      </mesh>

      <mesh position={accent.position} castShadow>
        <boxGeometry args={accent.args} />
        <meshStandardMaterial
          color={tile.accentColor}
          roughness={tile.isPremium ? 0.2 : 0.32}
          metalness={tile.isPremium ? 0.65 : 0.35}
          emissive={tile.accentColor}
          emissiveIntensity={tile.isPremium ? 0.14 : 0.07}
        />
      </mesh>

      <mesh position={owner.position}>
        <boxGeometry args={owner.args} />
        <meshStandardMaterial
          color={ownerColor}
          roughness={0.28}
          metalness={0.55}
          emissive={ownerColor}
          emissiveIntensity={tile.ownerColor ? 0.12 + (tile.ownerGlow ?? 0) : 0.008}
        />
      </mesh>

      {tile.isPremium && (
        <mesh position={[0, height / 2 + 0.023, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[tileSize * 0.23, 0.012, 8, 36]} />
          <meshStandardMaterial color={tile.accentColor} roughness={0.16} metalness={0.75} emissive={tile.accentColor} emissiveIntensity={0.06} />
        </mesh>
      )}

      <TileGlyph tile={tile} tileSize={tileSize} />

      <Text
        position={labelPos}
        rotation={rotation}
        fontSize={getLabelSize(tile.label, tile.isCorner)}
        color={colors.board.tileText}
        anchorX="center"
        anchorY="middle"
        maxWidth={tileSize * 0.88}
        textAlign="center"
        lineHeight={0.9}
        outlineColor={0x080604}
        outlineWidth={0.008}
        material-side={THREE.DoubleSide}
        material-toneMapped={false}
      >
        {label}
      </Text>

      {tile.subtitle && (
        <Text
          position={subtitlePos}
          rotation={rotation}
          fontSize={0.074}
          color={tile.accentColor}
          anchorX="center"
          anchorY="middle"
          maxWidth={tileSize * 0.7}
          textAlign="center"
          outlineColor={0x080604}
          outlineWidth={0.006}
          material-side={THREE.DoubleSide}
          material-toneMapped={false}
        >
          {tile.subtitle.toUpperCase()}
        </Text>
      )}
    </group>
  );
}