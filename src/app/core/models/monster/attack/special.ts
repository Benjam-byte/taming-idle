import { ElementType } from "../../common";
import { AttackAnimation, AttackBoostStat, AttackEffect } from "./common";

export type SpeAttackName =
  | 'griffure'
  | 'attack_boost'
  | 'focus'
  | 'regen'
  | 'defense_boost'
  | 'shield';

export type SpeAttackBase = {
  name: SpeAttackName;
  type: ElementType;
  description: string;
  turn: number;
  effect: AttackEffect;
  animation: AttackAnimation;
};

export type SpeAttackMultiple = SpeAttackBase & {
  effect: 'multiple';
  effiency: number;
  probability: number;
};

export type SpeAttackBoost = SpeAttackBase & {
  effect: 'boost';
  bonus: number;
  duration: number;
  stat: AttackBoostStat;
};

export type SpeAttackHeal = SpeAttackBase & {
  effect: 'heal';
  effiency: number;
};

export type SpeAttackShield = SpeAttackBase & {
  effect: 'shield';
  effiency: number;
};

export type SpeAttackStun = SpeAttackBase & {
  effect: 'stun';
  duration: number;
};

export type SpeAttack =
  | SpeAttackMultiple
  | SpeAttackBoost
  | SpeAttackHeal
  | SpeAttackShield
  | SpeAttackStun;