import { DEFAULT_PLAINE } from 'src/app/core/models/world/config/region.config';
import { WorldSave } from '../type/world';

export const DEFAULT_WORLD: WorldSave = {
  regions: { Plaines: DEFAULT_PLAINE },
  currentRegionName: 'Plaines',
  playerCoordinate: { x: 0, y: 0 },
  visitedTileKeys: [],
  seenTileKeys: [],
  spottedMonsterTileKeys: [],
  exploredChunkKeys: [],
  spentBurrowTileKeys: [],
  completedBurrowTileKeys: [],
  burrowDepositCollections: [],
  markers: [],
  tileMutations: [],
};
