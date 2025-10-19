import { CombatType } from 'src/app/database/bestiary/bestiary.type';
import { ProfessionName } from '../enum/profession-name.enum';
import { TraitName } from '../enum/trait.enum';

export const bestiaryList = [
    {
        name: 'Terra larva',
        image: {
            base: 'assets/monster/terra_larva/terra_larva.webp',
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
];

//   {
//         name: 'Wind Slime',
//         image: 'assets/monster/slime/Slime_air.webp',
//         type: 'wind',
//         seen: false,
//         maxLife: 10,
//         index: 2,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },
//     {
//         name: 'Fire Slime',
//         image: 'assets/monster/slime/Slime_Fire.webp',
//         type: 'fire',
//         seen: false,
//         maxLife: 10,
//         index: 3,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },
//     {
//         name: 'Earth Slime',
//         image: 'assets/monster/slime/Slime_Rock.webp',
//         type: 'earth',
//         seen: false,
//         maxLife: 10,
//         index: 4,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },
//     {
//         name: 'Water Slime',
//         image: 'assets/monster/slime/Slime_Water.webp',
//         type: 'water',
//         seen: false,
//         maxLife: 10,
//         index: 5,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },    {
//         name: 'Wind Duck',
//         image: 'assets/monster/duck/Duck_Air.webp',
//         type: 'wind',
//         seen: false,
//         maxLife: 10,
//         index: 7,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },
//     {
//         name: 'Fire Duck',
//         image: 'assets/monster/duck/Duck_Fire.webp',
//         type: 'fire',
//         seen: false,
//         maxLife: 10,
//         index: 8,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },
//     {
//         name: 'Earth Duck',
//         image: 'assets/monster/duck/Duck_Rock.webp',
//         type: 'earth',
//         seen: false,
//         maxLife: 10,
//         index: 9,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
//     },
//     {
//         name: 'Water Duck',
//         image: 'assets/monster/duck/Duck_Water.webp',
//         type: 'water',
//         seen: false,
//         maxLife: 10,
//         index: 10,
//         apparitionProbability: 0.5,
//         lootPercentage: {
//             slimeSoulPercentage: 15,
//             shinySlimeSoulPercentage: 0.5,
//         },
