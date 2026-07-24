import { Injectable } from '@angular/core';
import {
  AttackAnimation,
  AttackEffect,
  BaseAttackName,
  SpeAttack,
  SpeAttackName,
} from '../../../core/models/monster/';
import {
  CombatMonster,
  getBuffed,
  getBuffedCharacteristics,
  getDamageMultiplier,
  getHit,
  getWithAttackStocked,
  getWithNextAttackStocked,
  getWithSpentBuffTurn,
} from './combat-monster';

export type AttackKind = 'base' | 'special';
export type AttackAnimationTarget = 'attacker' | 'target';

type AttackSpeConfig = SpeAttack;

export type AttackResolution = {
  kind: AttackKind;
  attackName: BaseAttackName | SpeAttackName;
  effect: AttackEffect | 'damage';
  animation: AttackAnimation;
  animationTarget: AttackAnimationTarget;
  attacker: CombatMonster;
  target: CombatMonster;
  damage: number;
  damageByHit: number;
  healing: number;
  shield: number;
  hits: number;
};

@Injectable({
  providedIn: 'root',
})
export class AttackResolver {
  private readonly maxMultipleHits = 20;

  resolveAttack(
    attacker: CombatMonster,
    target: CombatMonster,
  ): AttackResolution {
    const specialAttack = attacker.attacks.special;

    if (attacker.attacks.stored >= specialAttack.turn) {
      return this.resolveSpecialAttack(attacker, target, specialAttack);
    }

    return this.resolveBaseAttack(attacker, target);
  }

  resolveBaseAttack(
    attacker: CombatMonster,
    target: CombatMonster,
  ): AttackResolution {
    const attack = attacker.attacks.base;
    const damage = this.resolveDamage(attacker, attack.effiency);

    return {
      kind: 'base',
      attackName: attack.name,
      effect: 'damage',
      animation: attack.animation,
      animationTarget: 'target',
      attacker: getWithSpentBuffTurn(getWithNextAttackStocked(attacker)),
      target: getHit(target, damage),
      damage,
      damageByHit: damage,
      healing: 0,
      shield: 0,
      hits: 1,
    };
  }

  private resolveSpecialAttack(
    attacker: CombatMonster,
    target: CombatMonster,
    attack: AttackSpeConfig,
  ): AttackResolution {
    switch (attack.effect) {
      case 'multiple':
        return this.resolveMultipleAttack(attacker, target, attack);
      case 'boost':
        return {
          kind: 'special',
          attackName: attack.name,
          effect: attack.effect,
          animation: attack.animation,
          animationTarget: 'attacker',
          attacker: getBuffed(
            getWithSpentBuffTurn(getWithAttackStocked(attacker, 0)),
            {
              effect: attack.effect,
              stat: attack.stat,
              bonus: attack.bonus,
              duration: attack.duration,
            },
          ),
          target,
          damage: 0,
          damageByHit: 0,
          healing: 0,
          shield: 0,
          hits: 0,
        };
      case 'heal': {
        const healing = this.resolveSupportAmount(attacker, attack.effiency);

        return {
          kind: 'special',
          attackName: attack.name,
          effect: attack.effect,
          animation: attack.animation,
          animationTarget: 'attacker',
          attacker: getBuffed(
            getWithSpentBuffTurn(getWithAttackStocked(attacker, 0)),
            {
              effect: attack.effect,
              amount: healing,
            },
          ),
          target,
          damage: 0,
          damageByHit: 0,
          healing,
          shield: 0,
          hits: 0,
        };
      }
      case 'shield': {
        const shield = this.resolveSupportAmount(attacker, attack.effiency);

        return {
          kind: 'special',
          attackName: attack.name,
          effect: attack.effect,
          animation: attack.animation,
          animationTarget: 'attacker',
          attacker: getBuffed(
            getWithSpentBuffTurn(getWithAttackStocked(attacker, 0)),
            {
              effect: attack.effect,
              amount: shield,
            },
          ),
          target,
          damage: 0,
          damageByHit: 0,
          healing: 0,
          shield,
          hits: 0,
        };
      }
      case 'stun':
        return {
          kind: 'special',
          attackName: attack.name,
          effect: attack.effect,
          animation: attack.animation,
          animationTarget: 'target',
          attacker: getWithSpentBuffTurn(getWithAttackStocked(attacker, 0)),
          target,
          damage: 0,
          damageByHit: 0,
          healing: 0,
          shield: 0,
          hits: 0,
        };
    }
  }

  private resolveMultipleAttack(
    attacker: CombatMonster,
    target: CombatMonster,
    attack: Extract<AttackSpeConfig, { effect: 'multiple' }>,
  ): AttackResolution {
    let hits = 1;

    while (hits < this.maxMultipleHits && Math.random() < attack.probability) {
      hits += 1;
    }

    const damageByHit = this.resolveDamage(attacker, attack.effiency);
    const damage = hits * damageByHit;

    return {
      kind: 'special',
      attackName: attack.name,
      effect: attack.effect,
      animation: attack.animation,
      animationTarget: 'target',
      attacker: getWithSpentBuffTurn(getWithAttackStocked(attacker, 0)),
      target,
      damage,
      damageByHit,
      healing: 0,
      shield: 0,
      hits,
    };
  }

  private resolveDamage(attacker: CombatMonster, effiency: number): number {
    const buffedCharacteristics = getBuffedCharacteristics(attacker);
    const rawDamage =
      buffedCharacteristics.attack *
      getDamageMultiplier(attacker) *
      (effiency / 100);

    return Math.max(1, Math.round(rawDamage));
  }

  private resolveSupportAmount(
    attacker: CombatMonster,
    effiency: number,
  ): number {
    return Math.max(
      1,
      Math.round(attacker.attribut.baseCharacteristics.hp * (effiency / 100)),
    );
  }
}
