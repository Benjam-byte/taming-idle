import { MonsterDefintion, MonsterName } from '../monster';

export const MONSTER_DEFINITION_RECORD: Record<MonsterName, MonsterDefintion> =
  {
    'Terra larva': {
      stats: {
        initiative: { base: 1 },
        defense: { base: 0 },
        attack: { base: 4 },
        hp: { base: 10 },
        speed: { base: 1 },
        field_of_view: { base: 1 },
        perception: { base: 1 },
        mana: { base: 1 },
        food_gathering_rate: { base: 1 },
        ore_gathering_rate: { base: 1 },
      },
      name: 'Terra larva',
      type: 'neutre',
      baseAttack: 'frappe',
      speAttackList: ['griffure', 'focus', 'attack_boost'],
      reward: { soul: 0, glitchedStone: 0 },
    },
    Slime: {
      stats: {
        initiative: { base: 5 },
        defense: { base: 0 },
        attack: { base: 1 },
        hp: { base: 20 },
        speed: { base: 1 },
        field_of_view: { base: 1 },
        perception: { base: 1 },
        mana: { base: 1 },
        food_gathering_rate: { base: 1 },
        ore_gathering_rate: { base: 1 },
      },
      name: 'Slime',
      type: 'neutre',
      baseAttack: 'baffe',
      speAttackList: ['regen', 'defense_boost', 'shield'],
      reward: { soul: 3, glitchedStone: 1 },
    },
  };
