import { MonsterProfession } from '../tamedMonster/tamed-monster.type';

export type Human = {
    id: string;
    level: number;
    relicId: string;
    travellingSpeed: number;
    fightingSpeed: number;
    lockPickingSpeed: number;
    gatherNormalBonus: number;
    gatherEnchantedBonus: number;
    lootNormalBonus: number;
    lootEnchantedBonus: number;
    findingPercentage: number;
    damage: number;
    damageSpecial: number;
    defense: number;
    defenseSpecial: number;
    precision: number;
    criticalChance: number;
    statCap: Record<string, number>;
    availableProfession: MonsterProfession[];
};
