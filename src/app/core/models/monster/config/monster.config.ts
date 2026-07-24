import { MonsterDefintion, MonsterName } from '../monster';

export const MONSTER_DEFINITION_RECORD: Record<MonsterName, MonsterDefintion> =
  {
    'Terra larva': {
      stats: {
        initiative: { mu: 1, n: 0 },
        defense: { mu: 1, n: 0 },
        attack: { mu: 1, n: 0 },
        hp: { mu: 1, n: 0 },
        speed: { mu: 1, n: 0 },
        field_of_view: { mu: 1, n: 0 },
        perception: { mu: 1, n: 0 },
        mana: { mu: 1, n: 0 },
        food_gathering_rate: { mu: 1, n: 0 },
        ore_gathering_rate: { mu: 1, n: 0 },
      },
      name: 'Terra larva',
      type: 'neutre',
      baseAttack: 'frappe',
      speAttackList: ['griffure', 'focus', 'attack_boost'],
      reward: { soul: 0, glitchedStone: 0 },
    },
    Slime: {
      stats: {
        initiative: { mu: 1, n: 0 },
        defense: { mu: 1, n: 0 },
        attack: { mu: 1, n: 0 },
        hp: { mu: 1, n: 0 },
        speed: { mu: 1, n: 0 },
        field_of_view: { mu: 1, n: 0 },
        perception: { mu: 1, n: 0 },
        mana: { mu: 1, n: 0 },
        food_gathering_rate: { mu: 1, n: 0 },
        ore_gathering_rate: { mu: 1, n: 0 },
      },
      name: 'Slime',
      type: 'neutre',
      baseAttack: 'baffe',
      speAttackList: ['regen', 'defense_boost', 'shield'],
      reward: { soul: 3, glitchedStone: 1 },
    },
  };
