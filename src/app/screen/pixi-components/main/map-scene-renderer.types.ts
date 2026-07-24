import type { MonsterReward } from 'src/app/core/models/monster';

export type PixiTick = {
  deltaMS: number;
};

export type DropType = 'soul' | 'glitchedStone';

export type MonsterDropReward = Partial<MonsterReward>;

export type MapSceneRendererCallbacks = {
  onResourceClick: () => void;
  onMonsterClick: () => void;
  onDropClick: (dropType: DropType) => void;
};
