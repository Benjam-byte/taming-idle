import type { BaseAttackKey, AttackSpeKey } from './attack';
import { MonsterDefintion } from './type/monster-type';

export const MonsterDict: MonsterDefintion<BaseAttackKey, AttackSpeKey>[] = [
    {
        name: 'Terra larva',
        type: 'neutre',
        baseAttack: 'frappe',
        attackSpeList: ['griffure', 'focus', 'attack_boost'],
    },
    {
        name: 'Slime',
        type: 'neutre',
        baseAttack: 'Baffe',
        attackSpeList: ['regen', 'defense_boost', 'shield'],
    },
];
