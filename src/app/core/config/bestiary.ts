import { CombatType } from 'src/app/database/bestiary/bestiary.type';
import { ProfessionName } from '../enum/profession-name.enum';
import { TraitName } from '../enum/trait.enum';

export const bestiaryList = [
    {
        name: 'Terra larva',
        image: {
            base: 'assets/monster/terra_larva/Terra_larva.webp',
            sprite: '',
            enchantedSprite: '',
        },
        type: 'normal',
        combatType: 'combattant' as CombatType,
        seen: true,
        index: 0,
        trait: TraitName.Multiskilled,
        availableProfession: [
            ProfessionName.Alchimiste,
            ProfessionName.Botaniste,
            ProfessionName.Fermier,
            ProfessionName.Guerrier,
            ProfessionName.Necromancien,
            ProfessionName.Pisteur,
            ProfessionName.Voleur,
            ProfessionName.Voyageur,
        ],
    },
    {
        name: 'Slime',
        image: {
            base: 'assets/monster/slime/Slime_Base.webp',
            sprite: 'assets/monster/sprite/slime/SpriteSheet_Slime_Sauvage.webp',
            enchantedSprite:
                'assets/monster/sprite/slime/SpriteSheet_Slime_Sauvage_Shinny.webp',
        },
        type: 'normal',
        trait: TraitName.Agile,
        combatType: 'combattant' as CombatType,
        seen: false,
        index: 1,
        availableProfession: [
            ProfessionName.Fermier,
            ProfessionName.Alchimiste,
            ProfessionName.Voyageur,
        ],
    },
    {
        name: 'Duck',
        image: {
            base: 'assets/monster/duck/Duck.webp',
            sprite: 'assets/monster/sprite/duck/SpriteSheet_Duck_Sauvage.webp',
            enchantedSprite:
                'assets/monster/sprite/duck/SpriteSheet_Duck_Sauvage_Shinny.webp',
        },
        type: 'normal',
        trait: TraitName.Renifleur,
        combatType: 'mage' as CombatType,
        seen: false,
        index: 2,
        availableProfession: [
            ProfessionName.Alchimiste,
            ProfessionName.Guerrier,
            ProfessionName.Necromancien,
        ],
    },
    {
        name: 'Wind Slime',
        image: {
            base: 'assets/monster/slime/Slime_air.webp',
            sprite: 'assets/monster/sprite/slime/SpriteSheet_Slime_Air.webp',
            enchantedSprite:
                'assets/monster/sprite/slime/SpriteSheet_Slime_Air_Shinny.webp',
        },
        type: 'wind',
        trait: TraitName.Agile,
        combatType: 'assassin' as CombatType,
        seen: false,
        index: 3,
        availableProfession: [
            ProfessionName.Voleur,
            ProfessionName.Pisteur,
            ProfessionName.Voyageur,
        ],
    },
    {
        name: 'Fire Slime',
        image: {
            base: 'assets/monster/slime/Slime_Fire.webp',
            sprite: 'assets/monster/sprite/slime/SpriteSheet_Slime_Fire.webp',
            enchantedSprite:
                'assets/monster/sprite/slime/SpriteSheet_Slime_Fire_Shinny.webp',
        },
        type: 'fire',
        trait: TraitName.Fougueux,
        combatType: 'berserk' as CombatType,
        seen: false,
        index: 4,
        availableProfession: [
            ProfessionName.Guerrier,
            ProfessionName.Voleur,
            ProfessionName.Alchimiste,
        ],
    },
    {
        name: 'Earth Slime',
        image: {
            base: 'assets/monster/slime/Slime_Rock.webp',
            sprite: 'assets/monster/sprite/slime/SpriteSheet_Slime_Rock.webp',
            enchantedSprite:
                'assets/monster/sprite/slime/SpriteSheet_Slime_Rock_Shinny.webp',
        },
        type: 'earth',
        trait: TraitName.Robuste,
        combatType: 'tank' as CombatType,
        seen: false,
        index: 5,
        availableProfession: [
            ProfessionName.Guerrier,
            ProfessionName.Fermier,
            ProfessionName.Botaniste,
        ],
    },
    {
        name: 'Water Slime',
        image: {
            base: 'assets/monster/slime/Slime_Water.webp',
            sprite: 'assets/monster/sprite/slime/SpriteSheet_Slime_Water.webp',
            enchantedSprite:
                'assets/monster/sprite/slime/SpriteSheet_Slime_Water_Shinny.webp',
        },
        type: 'water',
        trait: TraitName.MainVerte,
        combatType: 'mage' as CombatType,
        seen: false,
        index: 6,
        availableProfession: [
            ProfessionName.Alchimiste,
            ProfessionName.Necromancien,
            ProfessionName.Botaniste,
        ],
    },
    {
        name: 'Wind Duck',
        image: {
            base: 'assets/monster/duck/Duck_Air.webp',
            sprite: 'assets/monster/sprite/duck/SpriteSheet_Duck_Air.webp',
            enchantedSprite:
                'assets/monster/sprite/duck/SpriteSheet_Duck_Air_Shinny.webp',
        },
        type: 'wind',
        trait: TraitName.Agile,
        combatType: 'assassin' as CombatType,
        seen: false,
        index: 7,
        availableProfession: [
            ProfessionName.Voleur,
            ProfessionName.Pisteur,
            ProfessionName.Voyageur,
        ],
    },
    {
        name: 'Fire Duck',
        image: {
            base: 'assets/monster/duck/Duck_Fire.webp',
            sprite: 'assets/monster/sprite/duck/SpriteSheet_Duck_Fire.webp',
            enchantedSprite:
                'assets/monster/sprite/duck/SpriteSheet_Duck_Fire_Shinny.webp',
        },
        type: 'fire',
        trait: TraitName.Fougueux,
        combatType: 'berserk' as CombatType,
        seen: false,
        index: 8,
        availableProfession: [
            ProfessionName.Guerrier,
            ProfessionName.Alchimiste,
            ProfessionName.Necromancien,
        ],
    },
    {
        name: 'Earth Duck',
        image: {
            base: 'assets/monster/duck/Duck_Rock.webp',
            sprite: 'assets/monster/sprite/duck/SpriteSheet_Duck_Rock.webp',
            enchantedSprite:
                'assets/monster/sprite/duck/SpriteSheet_Duck_Rock_Shinny.webp',
        },
        type: 'earth',
        trait: TraitName.Robuste,
        combatType: 'tank' as CombatType,
        seen: false,
        index: 9,
        availableProfession: [
            ProfessionName.Guerrier,
            ProfessionName.Fermier,
            ProfessionName.Botaniste,
        ],
    },
    {
        name: 'Water Duck',
        image: {
            base: 'assets/monster/duck/Duck_Water.webp',
            sprite: 'assets/monster/sprite/duck/SpriteSheet_Duck_Water.webp',
            enchantedSprite:
                'assets/monster/sprite/duck/SpriteSheet_Duck_Water_Shinny.webp',
        },
        type: 'water',
        trait: TraitName.MainVerte,
        combatType: 'mage' as CombatType,
        seen: false,
        index: 10,
        availableProfession: [
            ProfessionName.Alchimiste,
            ProfessionName.Necromancien,
            ProfessionName.Botaniste,
        ],
    },
];
