import { Monster } from 'src/app/core/models/monster';

export type TamedMonster = {
  id: string;
  monster: Monster;
  tamedAt: string;
};

export type MonsterSave = {
  tamed: TamedMonster[];
};
