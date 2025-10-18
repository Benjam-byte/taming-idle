export type MonsterProfile = {
    id: string;
    name: string;
    image: {
        base: string;
        sprite: string;
        enchantedSprite: string;
    };
    type: string;
    trait: string;
    professionAvailable: string[];
    index: number;
    seen: boolean;
    combatType: CombatType;
};

export type MonsterType = 'normal' | 'fire' | 'earth' | 'water' | 'wind';

export type CombatType =
    | 'tank'
    | 'mage'
    | 'combattant'
    | 'berserk'
    | 'assassin';
