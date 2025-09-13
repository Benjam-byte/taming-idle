export type Relics = {
  id: string;
  name: string;
  rank: number;
  description: string;
  imagePath: string;
  effet: { stat: string; value: number };
  entityId: string | null;
  quantity: number;
};
