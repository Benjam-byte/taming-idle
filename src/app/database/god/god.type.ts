export type God = {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  order: number;
  level: number;
  offering: { price: number; statGain: number; ressource: string };
};
