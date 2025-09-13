export type MonsterProfile = {
  id: string;
  name: string;
  maxLife: number;
  apparitionProbability: number;
  lootPercentage: Record<string, number>;
};
