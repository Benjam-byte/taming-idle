export type God = {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  order: number;
  offering: { price: number; statGain: number; ressource: string };
};
