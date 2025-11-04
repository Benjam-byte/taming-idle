import { ProfessionName } from '../enum/profession-name.enum';
import { Expo, Linear, Poly2 } from '../models/functionType';

export const professionList = [
    {
        name: ProfessionName.Voyageur,
        index: 0,
        level: 1,
        xp: 0,
        description:
            'Se promener, se déplacer entre les dimensions pourrait vous donner un éclair de génie.',
        value: { stat: 'travellingSpeed', value: -50, description: '-50ms' },
        image: {
            '10': 'assets/profession/Traveler_I.avif',
            '20': 'assets/profession/Traveler_II.avif',
            '30': 'assets/profession/Traveler_III.avif',
        },
        function: {
            name: 'exp',
            parameter: {
                a: 20,
                b: 1.4,
                c: 20,
            },
        } as Expo,
    },
    {
        name: ProfessionName.Guerrier,
        index: 1,
        level: 1,
        xp: 0,
        description:
            'Se battre, peu importe l’endroit, pourrait vous donner un éclair de génie.',
        value: { stat: 'fightingSpeed', value: -50, description: '-50ms' },
        image: {
            '10': 'assets/profession/Guerrier_I.avif',
            '20': 'assets/profession/Guerrier_II.avif',
            '30': 'assets/profession/Guerrier_III.avif',
        },
        function: {
            name: 'poly2',
            parameter: {
                a: 0.2,
                b: 4.8,
                c: 5,
            },
        } as Poly2,
    },
    {
        name: ProfessionName.Fermier,
        index: 2,
        level: 1,
        xp: 0,
        description:
            'Récolter du blé ou planter un arbre pourrait vous donner un éclair de génie.',
        value: { stat: 'gatherNormalBonus', value: 0.5, description: '+5%' },
        image: {
            '10': 'assets/profession/Paysan_I.avif',
            '20': 'assets/profession/Paysan_II.avif',
            '30': 'assets/profession/Paysan_III.avif',
        },
        function: {
            name: 'exp',
            parameter: {
                a: 20,
                b: 1.4,
                c: 20,
            },
        } as Expo,
    },
    {
        name: ProfessionName.Voleur,
        index: 3,
        level: 1,
        xp: 0,
        description:
            'Crocheter un coffre ou commettre un méfait pourrait vous donner un éclair de génie.',
        value: { stat: 'lockPickingSpeed', value: -25, description: '-25ms' },
        image: {
            '10': 'assets/profession/Voleur_I.avif',
            '20': 'assets/profession/Voleur_II.avif',
            '30': 'assets/profession/Voleur_III.avif',
        },
        function: {
            name: 'exp',
            parameter: {
                a: 4.1,
                b: 1.9,
                c: 50,
            },
        } as Expo,
    },
    {
        name: ProfessionName.Botaniste,
        index: 4,
        level: 1,
        xp: 0,
        description:
            'Ramasser une plante rare est une expérience vraiment enrichissante.',
        value: {
            stat: 'gatherEnchantedBonus',
            value: 0.25,
            description: '+25%',
        },
        image: {
            '10': 'assets/profession/Botaniste_I.avif',
            '20': 'assets/profession/Botaniste_II.avif',
            '30': 'assets/profession/Botaniste_III.avif',
        },
        function: {
            name: 'poly2',
            parameter: {
                a: 3.5,
                b: 1.2,
                c: 3,
            },
        } as Poly2,
    },
    {
        name: ProfessionName.Alchimiste,
        index: 5,
        level: 1,
        xp: 0,
        description:
            'Collecter les âmes des monstres pourrait vous donner un éclair de génie.',
        value: { stat: 'lootNormalBonus', value: 0.2, description: '+20%' },
        image: {
            '10': 'assets/profession/Alchimie_I.png',
            '20': 'assets/profession/Alchimie_II.png',
            '30': 'assets/profession/Alchimie_II.png',
        },
        function: {
            name: 'exp',
            parameter: {
                a: 10,
                b: 1.4,
                c: 5,
            },
        } as Expo,
    },
    {
        name: ProfessionName.Necromancien,
        index: 6,
        level: 1,
        xp: 0,
        description:
            'Collecter des âmes enchantées pourrait vous donner un éclair de génie.',
        value: { stat: 'lootEnchantedBonus', value: 0.2, description: '+20%' },
        image: {
            '10': 'assets/profession/Necromancien_I.png',
            '20': 'assets/profession/Necromancien_II.png',
            '30': 'assets/profession/Necromancien_II.png',
        },
        function: {
            name: 'poly2',
            parameter: {
                a: 3.5,
                b: 1.2,
                c: 3,
            },
        } as Poly2,
    },
    {
        name: ProfessionName.Pisteur,
        index: 7,
        level: 1,
        xp: 0,
        description:
            'Trouver des monstres ou des trésors sur la carte vous fera gagner de l’expérience.',
        color: '#ffff00',
        value: { stat: 'findingPercentage', value: 0.05, description: '+5%' },
        image: {
            '10': 'assets/profession/detective_I.png',
            '20': 'assets/profession/detective_I_II.png',
            '30': 'assets/profession/detective_I_III.png',
        },
        function: {
            name: 'linear',
            parameter: {
                a: 0.1,
                b: 29,
                c: 3,
            },
        } as Linear,
    },
];
