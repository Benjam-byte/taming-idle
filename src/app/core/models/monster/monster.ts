import { pickWeightedChoice } from '../../helpers/random';
import { ElementType } from '../common';
import { BaseAttackName, SpeAttackName } from './attack';
import {
  generateStat,
  MonsterStat,
  StatDefinition,
  StatName,
} from './stat/stat';

export type MonsterName = 'Terra larva' | 'Slime';

export type MonsterReward = {
  soul: number;
  glitchedStone: number;
};

export type MonsterDefintion = {
  stats: Record<StatName, StatDefinition>;
  name: MonsterName;
  type: ElementType;
  baseAttack: BaseAttackName;
  speAttackList: SpeAttackName[];
  reward: MonsterReward;
};

export type Monster = {
  name: MonsterName;
  stats: MonsterStat;
  type: ElementType;
  baseAttack: BaseAttackName;
  speAttack: SpeAttackName;
};

export function generateMonster(definition: MonsterDefintion): Monster {
  const stats = Object.entries(definition.stats).reduce(
    (acc, [name, statDef]) => {
      return {
        ...acc,
        [name]: generateStat(statDef.base),
      };
    },
    {},
  ) as MonsterStat;

  return {
    name: definition.name,
    stats,
    type: definition.type,
    baseAttack: definition.baseAttack,
    speAttack: pickWeightedChoice(definition.speAttackList, [85, 10, 5]),
  };
}
