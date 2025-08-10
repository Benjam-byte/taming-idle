export interface ProfessionFromJson {
  profession: string;
  description: string;
  background: string;
  color: string;
  bonusA: string;
  bonusB: string;
  valueA: { stat: string; value: number };
  valueB: { stat: string; value: number };
}
