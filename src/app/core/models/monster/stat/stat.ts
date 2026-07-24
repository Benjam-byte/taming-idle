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

export type Stat = {
  level: number;
  value: number;
};

export type StatDefinition = {
  mu: number,
  n: number
}

export type MonsterStat = Record<StatName, Stat>

export function getHPByLevel(level: number): number {
  return 10 + 2 * level;
}

export function getDefenseByLevel(level: number): number {
  return Math.min(0.75, ((level - 1) * 3) / 196);
}

export function getDamageByLevel(level: number): number {
  return Math.ceil(level * 0.75);
}

export function getInitiativeByLevel(level: number): number {
  return level;
}
