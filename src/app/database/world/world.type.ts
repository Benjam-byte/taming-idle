export type availableRegion =
  | 'plaine'
  | 'volcan'
  | 'fight tower'
  | 'bermude'
  | 'wind moutain'
  | 'forest';

export type World = {
  id: string;
  regionUnlocked: availableRegion[];
  region: availableRegion;
  skillTreeAvailable: boolean;
  offrandeAvailable: boolean;
  monsterAvailable: boolean;
  metaGodAvailable: boolean;
  geometricLootRatio: number;
};
