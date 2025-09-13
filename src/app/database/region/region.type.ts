export type MapKey = 'tresor' | 'monster' | 'empty';

export type Region = {
  id: string;
  name: string;
  isSelected: boolean;
  lootDropPercentage: number;
  shinyLootDropPercentage: number;
  monsterWithTresorDropPercentage: number;
  monsterSpawnRate: number;
  shinyMonsterSpawnRate: number;
  monsterEggDropPercentage: number;
  tresorMapSpawnRate: number;
  existingMonsterType: string[];
};
