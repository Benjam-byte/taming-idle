import { pickWeightedChoice } from 'src/app/core/helpers/random';

export const STAT_NAME_LIST = [
  'initiative',
  'defense',
  'attack',
  'hp',
  'speed',
  'field_of_view',
  'perception',
  'mana',
  'food_gathering_rate',
  'ore_gathering_rate',
] as const;
export type StatName = (typeof STAT_NAME_LIST)[number];

export const enum Rarity {
  Normal,
  Rare,
  SuperRare,
  Legendary,
}

const MULT_BY_RARITY: Record<Rarity, number> = {
  [Rarity.Normal]: 1,
  [Rarity.Rare]: 1.15,
  [Rarity.SuperRare]: 1.15 * 1.15,
  [Rarity.Legendary]: 1.15 * 1.15 * 1.15,
};

export type Stat = {
  value: number;
  rarity: Rarity;
};

export type StatDefinition = {
  base: number;
};

export type MonsterStat = Record<StatName, Stat>;

export function generateStat(base: number): Stat {
  const rarity = pickWeightedChoice(
    [Rarity.Normal, Rarity.Rare, Rarity.SuperRare, Rarity.Legendary],
    [60, 25, 12, 3],
  );

  const mult = MULT_BY_RARITY[rarity];
  return {
    rarity,
    value: base * mult,
  };
}
