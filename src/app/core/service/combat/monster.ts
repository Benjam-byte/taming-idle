import { AttackSpeKey, BaseAttackKey } from 'src/app/config/attack';
import { AttackBoostStat } from 'src/app/config/type/attack-type';
import { MonsterType } from 'src/app/config/type/monster-type';

export type Stat = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};

export type ActiveBuff = {
  stat: AttackBoostStat;
  multiplier: number;
  remainingTurns: number;
};

export type MonsterBuff =
  | {
      effect: 'boost';
      stat: AttackBoostStat;
      bonus: number;
      duration: number;
    }
  | {
      effect: 'heal';
      amount: number;
    }
  | {
      effect: 'shield';
      amount: number;
    };

export class Monster {
  constructor(
    public readonly life: number,
    public readonly shield: number,
    public readonly stat: Stat,
    public readonly type: MonsterType,
    public readonly baseAttack: BaseAttackKey,
    public readonly attackStocked: number,
    public readonly attackSpe: AttackSpeKey,
    public readonly isAlive: boolean,
    public readonly buffList: readonly ActiveBuff[] = [],
  ) {}

  static create(
    stat: Stat,
    baseAttack: BaseAttackKey,
    attackSpe: AttackSpeKey,
  ): Monster {
    const maxLife = stat.hp;
    return new Monster(
      maxLife,
      0,
      stat,
      'neutre',
      baseAttack,
      0,
      attackSpe,
      true,
    );
  }

  get buffedStat(): Stat {
    return this.buffList.reduce<Stat>((nextStat, buff) => {
      if (buff.stat === 'damage') {
        return nextStat;
      }

      return {
        ...nextStat,
        [buff.stat]: Math.max(0, nextStat[buff.stat] * buff.multiplier),
      };
    }, this.stat);
  }

  get damageMultiplier(): number {
    return this.buffList
      .filter((buff) => buff.stat === 'damage')
      .reduce((multiplier, buff) => multiplier * buff.multiplier, 1);
  }

  getHit(damage: number): Monster {
    const incomingDamage = Math.max(0, damage);
    const absorbedDamage = Math.min(this.shield, incomingDamage);
    const nextShield = this.shield - absorbedDamage;
    const nextLife = Math.max(0, this.life - (incomingDamage - absorbedDamage));

    return new Monster(
      nextLife,
      nextShield,
      this.stat,
      this.type,
      this.baseAttack,
      this.attackStocked,
      this.attackSpe,
      nextLife > 0,
      this.buffList,
    );
  }

  getBuffed(buff: MonsterBuff): Monster {
    if (buff.effect === 'heal') {
      const nextLife = Math.min(this.stat.hp, this.life + buff.amount);

      return this.clone({
        life: nextLife,
        isAlive: nextLife > 0,
      });
    }

    if (buff.effect === 'shield') {
      return this.clone({
        shield: this.shield + Math.max(0, buff.amount),
      });
    }

    return this.clone({
      buffList: [
        ...this.buffList,
        {
          stat: buff.stat,
          multiplier: buff.bonus,
          remainingTurns: buff.duration,
        },
      ],
    });
  }

  getWithNextAttackStocked(): Monster {
    return this.getWithAttackStocked(this.attackStocked + 1);
  }

  getWithAttackStocked(attackStocked: number): Monster {
    return this.clone({
      attackStocked: Math.max(0, attackStocked),
    });
  }

  getWithSpentBuffTurn(): Monster {
    return this.clone({
      buffList: this.buffList
        .map((buff) => ({
          ...buff,
          remainingTurns: buff.remainingTurns - 1,
        }))
        .filter((buff) => buff.remainingTurns > 0),
    });
  }

  private clone(
    overrides: Partial<{
      life: number;
      shield: number;
      stat: Stat;
      type: MonsterType;
      baseAttack: BaseAttackKey;
      attackStocked: number;
      attackSpe: AttackSpeKey;
      isAlive: boolean;
      buffList: readonly ActiveBuff[];
    }>,
  ): Monster {
    return new Monster(
      overrides.life ?? this.life,
      overrides.shield ?? this.shield,
      overrides.stat ?? this.stat,
      overrides.type ?? this.type,
      overrides.baseAttack ?? this.baseAttack,
      overrides.attackStocked ?? this.attackStocked,
      overrides.attackSpe ?? this.attackSpe,
      overrides.isAlive ?? this.isAlive,
      overrides.buffList ?? this.buffList,
    );
  }
}
