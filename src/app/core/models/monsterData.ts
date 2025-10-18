import { CombatType } from 'src/app/database/bestiary/bestiary.type';

export type CombatStatKey =
    | 'damage'
    | 'damageSpecial'
    | 'defense'
    | 'defenseSpecial'
    | 'precision'
    | 'criticalChance';

export interface StatCap {
    damage: number;
    damageSpecial: number;
    defense: number;
    defenseSpecial: number;
    precision: number;
    criticalChance: number;
}

export const ALL_STATS: CombatStatKey[] = [
    'damage',
    'damageSpecial',
    'defense',
    'defenseSpecial',
    'precision',
    'criticalChance',
];

export const ARCHETYPE_FAV: Record<CombatType, CombatStatKey[]> = {
    tank: ['defense', 'defenseSpecial'],
    mage: ['damageSpecial', 'defenseSpecial'],
    combattant: ['damage', 'defense'],
    berserk: ['damage', 'criticalChance'],
    assassin: ['precision', 'criticalChance'],
};
