import { roll, rollCompoundChance } from '../helpers/proba-rolls';

const lootDict = {
    relicRank1: 0.1,
    glitchedStone: 0.9,
};

export default class Chest {
    crochetageSuccesProbability: number;
    loot: number;
    try: number;

    constructor() {
        this.crochetageSuccesProbability = 1 / 25;
        this.loot = 5;
        this.try = 0;
    }

    getCrocheted() {
        this.try++;
        return roll(this.crochetageSuccesProbability);
    }

    openChest() {
        return this.getRandomObject();
    }

    private getRandomObject(): string {
        const rand = Math.random();
        let cumulative = 0;

        for (const [key, prob] of Object.entries(lootDict)) {
            cumulative += prob;
            if (rand < cumulative) {
                return key;
            }
        }

        return 'glitchedStone';
    }
}
