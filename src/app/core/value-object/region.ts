type MapKey = 'tresor' | 'monster' | 'empty';

export class Region {
  name: string;
  lootDropPercentage: number;
  shinyLootDropPercentage: number;
  monsterWithTresorDropPercentage: number;

  monsterSpanwRate: number;
  shinyMonsterSpawnRate: number;
  monsterEggDropPercentage: number;
  tresorMapSpawnRate: number;

  constructor(name: string) {
    this.name = name;
    this.lootDropPercentage = 0;
    this.shinyLootDropPercentage = 0;
    this.monsterSpanwRate = 1 / 50;
    this.shinyMonsterSpawnRate = 0;
    this.monsterWithTresorDropPercentage = 0;
    this.monsterEggDropPercentage = 0;
    this.tresorMapSpawnRate = 0;
  }

  getMapDict(): Record<MapKey, number> {
    return {
      tresor: this.tresorMapSpawnRate,
      monster: this.monsterSpanwRate,
      empty: 1 - (this.tresorMapSpawnRate + this.monsterSpanwRate),
    };
  }
}
