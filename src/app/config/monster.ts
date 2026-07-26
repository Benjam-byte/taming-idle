import type { BaseAttackKey, AttackSpeKey } from './attack';
import { MonsterDefintion } from './type/monster-type';

export const MonsterDict: MonsterDefintion<BaseAttackKey, AttackSpeKey>[] = [
    {
        name: 'Terra larva',
        type: 'neutre',
        baseAttack: 'frappe',
        attackSpeList: ['griffure', 'focus', 'attack_boost'],
        reward: { soul: 0, glitchedStone: 0 },
    },
    {
        name: 'Slime',
        type: 'neutre',
        baseAttack: 'Baffe',
        attackSpeList: ['regen', 'defense_boost', 'shield'],
        reward: { soul: 3, glitchedStone: 1 },
    },
];
