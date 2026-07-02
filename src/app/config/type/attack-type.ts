import { MonsterType } from './monster-type';

export type AttackEffect = 'heal' | 'boost' | 'shield' | 'stun' | 'multiple';
export type AttackBoostStat = 'attack' | 'defense' | 'damage';
export type AttackAnimation = 'boost' | 'heal' | 'multiple' | 'shield' | 'simple';

export type BaseAttackDefinition = {
    name: string;
    effiency: number;
    type: MonsterType;
    description: string;
    animation: AttackAnimation;
};

export type AttackSpeBase = {
    name: string;
    type: MonsterType;
    description: string;
    turn: number;
    effect: AttackEffect;
    animation: AttackAnimation;
};

export type AttackSpeMultipleDefinition = AttackSpeBase & {
    effect: 'multiple';
    effiency: number;
    probability: number;
};

export type AttackSpeBoostDefinition = AttackSpeBase & {
    effect: 'boost';
    bonus: number;
    duration: number;
    stat: AttackBoostStat;
};

export type AttackSpeHealDefinition = AttackSpeBase & {
    effect: 'heal';
    effiency: number;
};

export type AttackSpeShieldDefinition = AttackSpeBase & {
    effect: 'shield';
    effiency: number;
};

export type AttackSpeStunDefinition = AttackSpeBase & {
    effect: 'stun';
    duration: number;
};

export type AttackSpeDefintion =
    | AttackSpeMultipleDefinition
    | AttackSpeBoostDefinition
    | AttackSpeHealDefinition
    | AttackSpeShieldDefinition
    | AttackSpeStunDefinition;
