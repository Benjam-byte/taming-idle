type MapKey = 'tresor' | 'monster' | 'empty';

export class Region {
  name: string;
  lootDropPercentage: number;
  shinyLootDropPercentage: number;
  monsterDropPercentage: number;
  shinyMonsterDropPercentage: number;
  monsterWithTresorDropPercentage: number;
  monsterEggDropPercentage: number;
  tresorMapPercentage: number;

  constructor(name: string) {
    this.name = name;
    this.lootDropPercentage = 0;
    this.shinyLootDropPercentage = 0;
    this.monsterDropPercentage = 1 / 50;
    this.shinyMonsterDropPercentage = 0;
    this.monsterWithTresorDropPercentage = 0;
    this.monsterEggDropPercentage = 0;
    this.tresorMapPercentage = 0;
  }

  getMapDict(): Record<MapKey, number> {
    return {
      tresor: this.tresorMapPercentage,
      monster: this.monsterDropPercentage,
      empty: 1 - (this.tresorMapPercentage + this.monsterDropPercentage),
    };
  }
}
