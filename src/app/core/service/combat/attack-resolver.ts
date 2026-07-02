import { Injectable } from '@angular/core';
import {
  AttackSpeDict,
  AttackSpeKey,
  BaseAttackDict,
  BaseAttackKey,
} from 'src/app/config/attack';
import {
  AttackEffect,
  AttackSpeDefintion,
  BaseAttackDefinition,
} from 'src/app/config/type/attack-type';
import { Monster } from './monster';

export type AttackKind = 'base' | 'special';

type BaseAttackConfig = BaseAttackDefinition & { name: BaseAttackKey };
type AttackSpeConfig = AttackSpeDefintion & { name: AttackSpeKey };

export type AttackResolution = {
  kind: AttackKind;
  attackName: BaseAttackKey | AttackSpeKey;
  effect: AttackEffect | 'damage';
  attacker: Monster;
  target: Monster;
  damage: number;
  healing: number;
  shield: number;
  hits: number;
};

@Injectable({
  providedIn: 'root',
})
export class AttackResolver {
  private readonly maxMultipleHits = 20;

  resolveAttack(attacker: Monster, target: Monster): AttackResolution {
    const specialAttack = this.getSpecialAttack(attacker.attackSpe);

    if (attacker.attackStocked >= specialAttack.turn) {
      return this.resolveSpecialAttack(attacker, target, specialAttack);
    }

    return this.resolveBaseAttack(attacker, target);
  }

  resolveBaseAttack(attacker: Monster, target: Monster): AttackResolution {
    const attack = this.getBaseAttack(attacker.baseAttack);
    const damage = this.resolveDamage(attacker, attack.effiency);

    return {
      kind: 'base',
      attackName: attack.name,
      effect: 'damage',
      attacker: attacker.getWithNextAttackStocked().getWithSpentBuffTurn(),
      target: target.getHit(damage),
      damage,
      healing: 0,
      shield: 0,
      hits: 1,
    };
  }

  private resolveSpecialAttack(
    attacker: Monster,
    target: Monster,
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
          attacker: attacker
            .getWithAttackStocked(0)
            .getWithSpentBuffTurn()
            .getBuffed({
              effect: attack.effect,
              stat: attack.stat,
              bonus: attack.bonus,
              duration: attack.duration,
            }),
          target,
          damage: 0,
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
          attacker: attacker
            .getWithAttackStocked(0)
            .getWithSpentBuffTurn()
            .getBuffed({
              effect: attack.effect,
              amount: healing,
            }),
          target,
          damage: 0,
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
          attacker: attacker
            .getWithAttackStocked(0)
            .getWithSpentBuffTurn()
            .getBuffed({
              effect: attack.effect,
              amount: shield,
            }),
          target,
          damage: 0,
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
          attacker: attacker.getWithAttackStocked(0).getWithSpentBuffTurn(),
          target,
          damage: 0,
          healing: 0,
          shield: 0,
          hits: 0,
        };
    }
  }

  private resolveMultipleAttack(
    attacker: Monster,
    target: Monster,
    attack: Extract<AttackSpeConfig, { effect: 'multiple' }>,
  ): AttackResolution {
    let hits = 0;

    while (
      hits < this.maxMultipleHits &&
      Math.random() < attack.probability
    ) {
      hits += 1;
    }

    const damage = hits * this.resolveDamage(attacker, attack.effiency);

    return {
      kind: 'special',
      attackName: attack.name,
      effect: attack.effect,
      attacker: attacker.getWithAttackStocked(0).getWithSpentBuffTurn(),
      target: damage > 0 ? target.getHit(damage) : target,
      damage,
      healing: 0,
      shield: 0,
      hits,
    };
  }

  private resolveDamage(attacker: Monster, effiency: number): number {
    const rawDamage =
      attacker.buffedStat.attack * attacker.damageMultiplier * (effiency / 100);

    return Math.max(1, Math.round(rawDamage));
  }

  private resolveSupportAmount(attacker: Monster, effiency: number): number {
    return Math.max(1, Math.round(attacker.stat.hp * (effiency / 100)));
  }

  private getBaseAttack(key: BaseAttackKey): BaseAttackConfig {
    const attack = BaseAttackDict.find((attackDef) => attackDef.name === key);

    if (!attack) {
      throw new Error(`Unknown base attack: ${key}`);
    }

    return attack;
  }

  private getSpecialAttack(key: AttackSpeKey): AttackSpeConfig {
    const attack = AttackSpeDict.find((attackDef) => attackDef.name === key);

    if (!attack) {
      throw new Error(`Unknown special attack: ${key}`);
    }

    return attack;
  }
}
