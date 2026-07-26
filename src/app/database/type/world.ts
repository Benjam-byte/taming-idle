import { Coordinate } from 'src/app/core/type/coordinate';
import { MapMarker } from 'src/app/core/type/map-maker';

export type TileMutation = {
  key: string;
  hasMonster: boolean;
  hasResource: boolean;
};

export type BurrowDepositCollection = {
  key: string;
  collected: number;
};

export type WorldSave = {
  playerCoordinate: Coordinate;
  visitedTileKeys: string[];
  seenTileKeys: string[];
  spottedMonsterTileKeys: string[];
  exploredChunkKeys: string[];
  spentBurrowTileKeys: string[];
  completedBurrowTileKeys: string[];
  burrowDepositCollections: BurrowDepositCollection[];
  markers: MapMarker[];
  tileMutations: TileMutation[];
};
