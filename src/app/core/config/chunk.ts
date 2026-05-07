import { TileGroundType, TileObstacleType } from '../service/map/tile';

export const ChunkConfig = [
  {
    name: 'default',
    numberOfMonster: 1,
    ressourceAvailable: 5,
    path: 'assets/map/plaine/Plaine',
  },
];

export type ChunkPatternType =
  | 'clearing'
  | 'darkClearing'
  | 'path'
  | 'stoneQuarry';

export const GROUND_ASSET_BY_TYPE: Record<TileGroundType, string[]> = {
  clearing: ['plaine1', 'plaine2', 'plaine3', 'plaine4', 'plaine5', 'plaine6'],
  darkClearing: ['darkClearing'],
  path: ['plaine1'],
  stoneQuarry: ['stonequarry'],
};

export const OBSTACLE_CHANCE_BY_CHUNK_TYPE: Record<
  ChunkPatternType,
  Record<Exclude<TileObstacleType, null>, number>
> = {
  clearing: {
    lake: 0.03,
    grove: 0.08,
  },
  darkClearing: {
    lake: 0.02,
    grove: 0.16,
  },
  path: {
    lake: 0.005,
    grove: 0.03,
  },
  stoneQuarry: {
    lake: 0.01,
    grove: 0.02,
  },
};
