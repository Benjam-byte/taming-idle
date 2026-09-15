import { Monster } from 'src/app/core/models/monster';

export type TamedMonster = {
  id: string;
  monster: Monster;
  tamedAt: string;
};

export const ACTIVE_TEAM_SIZE = 3;

export type MonsterSave = {
  tamed: TamedMonster[];
  activeTeamIds: (string | null)[];
};
