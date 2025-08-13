export type MapKey = 'tresor' | 'monster' | 'empty';

export type Region = {
  id: string;
  name: string;
  lootDropPercentage: number;
  shinyLootDropPercentage: number;
  monsterWithTresorDropPercentage: number;
  monsterSpawnRate: number;
  shinyMonsterSpawnRate: number;
  monsterEggDropPercentage: number;
  tresorMapSpawnRate: number;
};
