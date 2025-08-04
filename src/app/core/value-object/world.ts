type availableMap =
  | 'plaine'
  | 'volcan'
  | 'fight tower'
  | 'bermude'
  | 'wind moutain'
  | 'forest';

type MapKey = 'tresor' | 'monster' | 'empty';

export default class World {
  mapUnlocked: availableMap[];
  map: availableMap;
  wheatDropPercentage: number;
  shinyWheatDropPercentage: number;
  monsterDropPercentage: number;
  shinyMonsterDropPercentage: number;
  monsterWithTresorDropPercentage: number;
  monsterEggDropPercentage: number;
  tresorMapPercentage: number;
  mapDict: Record<MapKey, number>;

  constructor() {
    this.map = 'plaine';
    this.mapUnlocked = ['plaine'];
    this.wheatDropPercentage = 0;
    this.shinyWheatDropPercentage = 0;
    this.monsterDropPercentage = 0;
    this.shinyMonsterDropPercentage = 0;
    this.monsterWithTresorDropPercentage = 0;
    this.monsterEggDropPercentage = 0;
    this.tresorMapPercentage = 0;
    this.mapDict = {
      tresor: this.tresorMapPercentage,
      monster: this.monsterDropPercentage,
      empty: 1 - (this.tresorMapPercentage + this.monsterDropPercentage),
    };
  }

  getRandomMap(): MapKey {
    const rand = Math.random();
    let cumulative = 0;

    for (const [key, prob] of Object.entries(this.mapDict)) {
      cumulative += prob;
      if (rand < cumulative) {
        return key as MapKey;
      }
    }

    return 'empty';
  }
}
