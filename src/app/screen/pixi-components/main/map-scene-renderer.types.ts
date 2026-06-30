export type PixiTick = {
  deltaMS: number;
};

export type DropType = 'soul' | 'glitchedStone';

export type MonsterDropReward = {
  soul?: number;
  glitchedStone?: number;
};

export type MapSceneRendererCallbacks = {
  onResourceClick: () => void;
  onMonsterClick: () => void;
  onDropClick: (dropType: DropType) => void;
};
