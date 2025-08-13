export type Profession = {
  id: string;
  level: number;
  xp: number;
  name: string;
  description: string;
  background: string;
  color: string;
  bonusA: string;
  bonusB: string;
  valueA: { stat: string; value: number };
  valueB: { stat: string; value: number };
};
