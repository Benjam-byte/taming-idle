import { ProfessionName } from 'src/app/core/enum/profession-name.enum';
import { TraitName } from 'src/app/core/enum/trait.enum';

export type TamedMonster = {
    id: string;
    index: number;
    monsterId: string;
    name: string;
    monsterSpecies: string;
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
    trait: TraitName;
    statCap: Record<string, number>;
    availableProfession: MonsterProfession[];
};

export type Trait = {
    name: string;
    description: string;
};

export type MonsterProfession = {
    name: ProfessionName;
    level: number;
    xp: number;
    levelCap: number;
};
