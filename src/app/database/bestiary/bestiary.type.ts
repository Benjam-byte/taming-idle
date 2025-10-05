export type MonsterProfile = {
    id: string;
    name: string;
    image: string;
    type: string;
    index: number;
    maxLife: number;
    apparitionProbability: number;
    lootPercentage: Record<string, number>;
    seen: boolean;
};

export type MonsterType = 'normal' | 'fire' | 'earth' | 'water' | 'wind';
