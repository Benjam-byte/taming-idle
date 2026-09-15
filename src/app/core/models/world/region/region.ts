import { MonsterName } from '../../monster/monster';

export type Region = {
  monsterDensity: number;
  monsterManaDrop: number;
  soulDropRate: number;
  foodDensity: number;
  foodDropRate: number;
  oreAmount: number;
  unlockedMonsters: MonsterName[];
  shinyResourceRate: number;
};
