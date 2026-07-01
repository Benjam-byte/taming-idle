import { Coordinate } from 'src/app/core/type/coordinate';

export type MinimapConfig = {
  visibleTileWidth: number;
  visibleTileHeight: number;
  loadedChunkRadius: number;
  cellSize: number;
  padding: number;
  margin: number;
  borderRadius: number;
};

export type MinimapSize = {
  visiblePixelWidth: number;
  visiblePixelHeight: number;
  totalWidth: number;
  totalHeight: number;
};

export type MinimapTileState = {
  isVisibleNow: boolean;
  isVisited: boolean;
  isSeen: boolean;
  isKnown: boolean;
  isMonsterSpotted: boolean;
};

export type MinimapPositionTarget = Pick<Coordinate, 'x' | 'y'>;

export const minimapConfig: MinimapConfig = {
  visibleTileWidth: 8,
  visibleTileHeight: 8,
  loadedChunkRadius: 2,
  cellSize: 16,
  padding: 9,
  margin: 16,
  borderRadius: 14,
};
