export type MonsterStat =
  | 'attack'
  | 'life'
  | 'initiative'
  | 'power'
  | 'critical'
  | 'precision';

export type MonsterClass =
  | 'brute'
  | 'duelist'
  | 'berserker'
  | 'executioner'
  | 'swordsman'
  | 'vanguard'
  | 'paladin'
  | 'gladiator'
  | 'guardian'
  | 'summoner'
  | 'assassin'
  | 'ranger'
  | 'sorcerer'
  | 'arcanist'
  | 'hunter';

type StatPairKey = `${MonsterStat}:${MonsterStat}`;

const STAT_ORDER: Record<MonsterStat, number> = {
  attack: 0,
  life: 1,
  initiative: 2,
  power: 3,
  critical: 4,
  precision: 5,
};

const CLASS_BY_STATS = {
  'attack:life': 'brute',
  'attack:initiative': 'duelist',
  'attack:power': 'berserker',
  'attack:critical': 'executioner',
  'attack:precision': 'swordsman',

  'life:initiative': 'vanguard',
  'life:power': 'paladin',
  'life:critical': 'gladiator',
  'life:precision': 'guardian',

  'initiative:power': 'summoner',
  'initiative:critical': 'assassin',
  'initiative:precision': 'ranger',

  'power:critical': 'sorcerer',
  'power:precision': 'arcanist',

  'critical:precision': 'hunter',
} as const satisfies Partial<Record<StatPairKey, MonsterClass>>;

function getStatPairKey(first: MonsterStat, second: MonsterStat): StatPairKey {
  return STAT_ORDER[first] < STAT_ORDER[second]
    ? `${first}:${second}`
    : `${second}:${first}`;
}

export function getMonsterClass(
  first: MonsterStat,
  second: MonsterStat,
): MonsterClass | undefined {
  if (first === second) {
    return undefined;
  }

  const key = getStatPairKey(first, second);

  return CLASS_BY_STATS[key as keyof typeof CLASS_BY_STATS];
}
