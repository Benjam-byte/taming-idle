import { ProfessionName } from 'src/app/core/enum/profession-name.enum';
import { TraitName } from 'src/app/core/enum/trait.enum';

export type MonsterProfile = {
    id: string;
    name: string;
    image: {
        base: string;
        sprite: string;
        enchantedSprite: string;
    };
    type: string;
    trait: TraitName;
    index: number;
    seen: boolean;
    combatType: CombatType;
    availableProfession: ProfessionName[];
};

export type MonsterType = 'normal' | 'fire' | 'earth' | 'water' | 'wind';

export type CombatType =
    | 'tank'
    | 'mage'
    | 'combattant'
    | 'berserk'
    | 'assassin';
