import { WorldSave } from '../type/world';

export const DEFAULT_WORLD: WorldSave = {
  playerCoordinate: { x: 0, y: 0 },
  visitedTileKeys: [],
  seenTileKeys: [],
  spottedMonsterTileKeys: [],
  exploredChunkKeys: [],
  markers: [],
  tileMutations: [],
};
