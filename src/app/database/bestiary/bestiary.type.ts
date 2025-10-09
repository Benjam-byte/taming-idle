export type MonsterProfile = {
    id: string;
    name: string;
    image: string;
    type: string;
    trait: string;
    professionAvailable: string[];
    index: number;
    seen: boolean;
};

export type MonsterType = 'normal' | 'fire' | 'earth' | 'water' | 'wind';
