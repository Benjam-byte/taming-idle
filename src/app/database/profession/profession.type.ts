export type Profession = {
    id: string;
    index: number;
    level: number;
    xp: number;
    name: string;
    description: string;
    value: { stat: string; value: number };
    image: { 10: string; 20: string; 30: string };
};
