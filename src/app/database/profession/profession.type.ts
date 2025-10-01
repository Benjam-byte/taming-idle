export type Profession = {
    id: string;
    level: number;
    xp: number;
    name: string;
    description: string;
    color: string;
    bonus: string;
    value: { stat: string; value: number };
    image: { 10: string; 20: string; 30: string };
};
