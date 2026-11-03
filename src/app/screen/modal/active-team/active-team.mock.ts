import {
  MONSTER_PORTRAIT,
  MONSTER_TYPE_ICON,
} from 'src/app/core/assets/monster-portraits';
import {
  Monster,
  MONSTER_DEFINITION_RECORD,
  MonsterName,
  MonsterStat,
  Rarity,
  SpeAttackName,
} from 'src/app/core/models/monster';
import { MonsterSave, TamedMonster } from 'src/app/database/type/monster';

function mockMonster(name: MonsterName, speAttack: SpeAttackName): Monster {
  const { stats, type, baseAttack } = MONSTER_DEFINITION_RECORD[name];

  return {
    name,
    stats: Object.entries(stats).reduce(
      (acc, [statName, statDef]) => ({
        ...acc,
        [statName]: { value: statDef.base, rarity: Rarity.Normal },
      }),
      {},
    ) as MonsterStat,
    type,
    baseAttack,
    speAttack,
  };
}

function mockTamed(
  id: string,
  name: MonsterName,
  speAttack: SpeAttackName,
): TamedMonster {
  return {
    id,
    monster: mockMonster(name, speAttack),
    tamedAt: '2026-01-01T00:00:00.000Z',
  };
}

export const MOCK_TAMED_MONSTERS: TamedMonster[] = [
  mockTamed('mock-slime-regen', 'Slime', 'regen'),
  mockTamed('mock-terra-larva', 'Terra larva', 'griffure'),
  mockTamed('mock-slime-shield', 'Slime', 'shield'),
];

const MOCK_ACTIVE_TEAM: (TamedMonster | null)[] = [
  MOCK_TAMED_MONSTERS[0],
  MOCK_TAMED_MONSTERS[1],
  null,
];

export const MOCK_MONSTER_SAVE: MonsterSave = {
  tamed: MOCK_TAMED_MONSTERS,
  activeTeamIds: MOCK_ACTIVE_TEAM.map((tamed) => tamed?.id ?? null),
};

export const MOCK_ACTIVE_SLOTS = MOCK_ACTIVE_TEAM.map((tamed) =>
  tamed
    ? {
        tamedId: tamed.id,
        name: tamed.monster.name,
        portraitSrc: MONSTER_PORTRAIT[tamed.monster.name],
        typeIconSrc: MONSTER_TYPE_ICON[tamed.monster.type],
      }
    : null,
);
