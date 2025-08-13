type MapKey = 'tresor' | 'monster' | 'empty';

export class Region {
  name: string;
  lootDropPercentage: number;
  shinyLootDropPercentage: number;
  monsterWithTresorDropPercentage: number;

  monsterSpawnRate: number;
  shinyMonsterSpawnRate: number;
  monsterEggDropPercentage: number;
  tresorMapSpawnRate: number;

  constructor(name: string) {
    this.name = name;
    this.lootDropPercentage = 0;
    this.shinyLootDropPercentage = 0;
    this.monsterSpawnRate = 0;
    this.shinyMonsterSpawnRate = 0;
    this.monsterWithTresorDropPercentage = 0;
    this.monsterEggDropPercentage = 0;
    this.tresorMapSpawnRate = 0;
  }

  getMapDict(): Record<MapKey, number> {
    return {
      tresor: this.tresorMapSpawnRate,
      monster: this.monsterSpawnRate,
      empty: 1 - (this.tresorMapSpawnRate + this.monsterSpawnRate),
    };
  }
}
