import {
  AttackBoostStat,
  BASE_ATTACK_RECORD,
  BaseAttack,
  Monster,
  SPE_ATTACK_RECORD,
  SpeAttack,
} from '../../models/monster';

export type CombatMonster = {
  monster: Monster;
  attacks: {
    stored: number;
    base: BaseAttack;
    special: SpeAttack;
  };
  attribut: {
    baseCharacteristics: Characteristics;
    currentCharacteristics: Characteristics;
    buffs: ActiveBuff[];
  };
};

export function generateCombatMonster(monster: Monster): CombatMonster {
  return {
    monster,
    attacks: {
      stored: 0,
      base: BASE_ATTACK_RECORD[monster.baseAttack],
      special: SPE_ATTACK_RECORD[monster.speAttack],
    },
    attribut: {
      baseCharacteristics: {
        hp: monster.stats.hp.value,
        attack: monster.stats.attack.value,
        defense: monster.stats.defense.value,
        shield: 0,
        speed: monster.stats.initiative.value,
      },
      currentCharacteristics: {
        hp: monster.stats.hp.value,
        attack: monster.stats.attack.value,
        defense: monster.stats.defense.value,
        shield: 0,
        speed: monster.stats.initiative.value,
      },
      buffs: [],
    },
  };
}

export function isAlive(m: CombatMonster): boolean {
  return m.attribut.currentCharacteristics.hp > 0;
}

export function getHit(m: CombatMonster, damage: number): CombatMonster {
  const incomingDamage = Math.max(0, damage);
  const shield = m.attribut.currentCharacteristics.shield;
  const absorbedDamage = Math.min(shield, incomingDamage);
  const nextShield = shield - absorbedDamage;
  const nextHp = Math.max(
    0,
    m.attribut.currentCharacteristics.hp - (incomingDamage - absorbedDamage),
  );

  return {
    ...m,
    attribut: {
      ...m.attribut,
      currentCharacteristics: {
        ...m.attribut.currentCharacteristics,
        hp: nextHp,
        shield: nextShield,
      },
    },
  };
}

export function getBuffed(m: CombatMonster, buff: MonsterBuff): CombatMonster {
  if (buff.effect === 'heal') {
    const nextHp = Math.min(
      m.attribut.baseCharacteristics.hp,
      m.attribut.currentCharacteristics.hp + buff.amount,
    );

    return {
      ...m,
      attribut: {
        ...m.attribut,
        currentCharacteristics: {
          ...m.attribut.currentCharacteristics,
          hp: nextHp,
        },
      },
    };
  }

  if (buff.effect === 'shield') {
    return {
      ...m,
      attribut: {
        ...m.attribut,
        currentCharacteristics: {
          ...m.attribut.currentCharacteristics,
          shield:
            m.attribut.currentCharacteristics.shield + Math.max(0, buff.amount),
        },
      },
    };
  }

  return {
    ...m,
    attribut: {
      ...m.attribut,
      buffs: [
        ...m.attribut.buffs,
        {
          stat: buff.stat,
          multiplier: buff.bonus,
          remainingTurns: buff.duration,
        },
      ],
    },
  };
}

export function getWithAttackStocked(
  m: CombatMonster,
  stored: number,
): CombatMonster {
  return {
    ...m,
    attacks: {
      ...m.attacks,
      stored: Math.max(0, stored),
    },
  };
}

export function getWithNextAttackStocked(m: CombatMonster): CombatMonster {
  return getWithAttackStocked(m, m.attacks.stored + 1);
}

export function getWithSpentBuffTurn(m: CombatMonster): CombatMonster {
  return {
    ...m,
    attribut: {
      ...m.attribut,
      buffs: m.attribut.buffs
        .map((buff) => ({
          ...buff,
          remainingTurns: buff.remainingTurns - 1,
        }))
        .filter((buff) => buff.remainingTurns > 0),
    },
  };
}

export function getBuffedCharacteristics(m: CombatMonster): Characteristics {
  return m.attribut.buffs.reduce<Characteristics>((chars, buff) => {
    if (buff.stat === 'damage') {
      return chars;
    }

    return {
      ...chars,
      [buff.stat]: Math.max(0, chars[buff.stat] * buff.multiplier),
    };
  }, m.attribut.currentCharacteristics);
}

export function getDamageMultiplier(m: CombatMonster): number {
  return m.attribut.buffs
    .filter((buff) => buff.stat === 'damage')
    .reduce((multiplier, buff) => multiplier * buff.multiplier, 1);
}

type Characteristics = {
  hp: number;
  attack: number;
  defense: number;
  shield: number;
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
