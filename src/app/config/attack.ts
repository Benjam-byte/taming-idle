import { AttackSpeDefintion, BaseAttackDefinition } from './type/attack-type';

export const BaseAttackDict: BaseAttackDefinition[] = [
    {
        name: 'frappe',
        effiency: 20, // Applique 20% des degats de l'utilisateur
        type: 'neutre',
        description: 'un coup simple',
    },
    {
        name: 'Baffe',
        effiency: 30,
        type: 'neutre',
        description: 'un coup leger mais qui fait du bruit',
    },
];

export type BaseAttackKey = (typeof BaseAttackDict)[number]['name'];

export const AttackSpeDict: AttackSpeDefintion[] = [
    {
        name: 'griffure',
        effect: 'multiple',
        description: 'un coup rapide repeté avec 50% echec',
        type: 'neutre',
        turn: 4,
        effiency: 10,
        probability: 0.5,
    },
    {
        name: 'attack_boost',
        effect: 'boost',
        description: '*0.5 en attack',
        type: 'neutre',
        turn: 3,
        bonus: 0.5,
        duration: 5,
        stat: 'attack',
    },
    {
        name: 'focus',
        effect: 'boost',
        description: '*2 damage',
        type: 'neutre',
        turn: 5,
        bonus: 2,
        duration: 1,
        stat: 'damage',
    },
    {
        name: 'regen',
        effect: 'heal',
        description: 'un petit heal de rien du tout',
        type: 'neutre',
        turn: 3,
        effiency: 5,
    },
    {
        name: 'defense_boost',
        effect: 'boost',
        description: '*0.5 en defense',
        type: 'neutre',
        turn: 2,
        bonus: 0.5,
        duration: 5,
        stat: 'attack',
    },
    {
        name: 'shield',
        effect: 'shield',
        description: 'un petit shield de rien du tout',
        type: 'neutre',
        turn: 4,
        effiency: 10,
    },
];

export type AttackSpeKey = (typeof AttackSpeDict)[number]['name'];
