import { ACTIVE_TEAM_SIZE, MonsterSave } from '../type/monster';

export const DEFAULT_MONSTER: MonsterSave = {
  tamed: [],
  activeTeamIds: Array.from({ length: ACTIVE_TEAM_SIZE }, () => null),
};
