type MapKey = 'tresor' | 'monster' | 'empty';

export class Region {
    name: string;
    monsterResourceQuantity: number;
    enchantedMonsterResource: number;
    monsterWithTresorDropPercentage: number;

    monsterSpawnRate: number;
    shinyMonsterSpawnRate: number;
    monsterEggDropPercentage: number;
    tresorMapSpawnRate: number;

    constructor(name: string) {
        this.name = name;
        this.monsterResourceQuantity = 0;
        this.enchantedMonsterResource = 0;
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
