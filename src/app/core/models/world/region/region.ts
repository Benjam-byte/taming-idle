import { MonsterName } from '../../monster/monster';

export const REGION_NAMES = ['Plaines'] as const;
export type RegionName = (typeof REGION_NAMES)[number];

export type Region = {
  imageSrc: string;
  description: string;
  monsterDensity: number;
  monsterManaDrop: number;
  soulDropRate: number;
  foodDensity: number;
  foodDropRate: number;
  oreAmount: number;
  unlockedMonsters: MonsterName[];
  shinyResourceRate: number;
};
