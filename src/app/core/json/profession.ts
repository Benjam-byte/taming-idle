export const professionList = [
    {
        name: 'Voyageur',
        index: 1,
        level: 0,
        xp: 0,
        description:
            'Se promener, se deplacer dans les dimensions pourrez vous donnez un éclair de génie',
        value: { stat: 'travellingSpeed', value: -50 },
        image: {
            '10': 'assets/profession/Traveler_I.avif',
            '20': 'assets/profession/Traveler_II.avif',
            '30': 'assets/profession/Traveler_III.avif',
        },
    },
    {
        name: 'Guerrier',
        index: 1,
        level: 1,
        xp: 0,
        description:
            "Se battre peu importe l'endroit pourrez vous donnez un éclair de génie",
        value: { stat: 'fightingSpeed', value: -50 },
        image: {
            '10': 'assets/profession/Guerrier_I.avif',
            '20': 'assets/profession/Guerrier_II.avif',
            '30': 'assets/profession/Guerrier_III.avif',
        },
    },
    {
        name: 'Fermier',
        index: 2,
        level: 1,
        xp: 0,
        description:
            'Collecter du blé, planter un arbre pourrez vous donnez un éclair de génie',
        value: { stat: 'gatherNormalBonus', value: 0.5 },
        image: {
            '10': 'assets/profession/Paysan_I.avif',
            '20': 'assets/profession/Paysan_II.avif',
            '30': 'assets/profession/Paysan_III.avif',
        },
    },
    {
        name: 'Voleur',
        index: 3,
        level: 1,
        xp: 0,
        description:
            'Crocheter un coffre, commettre un mefait pourrez vous donnez un éclair de génie',
        value: { stat: 'lockPickingSpeed', value: -25 },
        image: {
            '10': 'assets/profession/Voleur_I.avif',
            '20': 'assets/profession/Voleur_II.avif',
            '30': 'assets/profession/Voleur_III.avif',
        },
    },
    {
        name: 'Botaniste',
        index: 4,
        level: 1,
        xp: 0,
        description: "Ramasser une plante rare c'est vraiment super",
        value: { stat: 'gatherEnchantedBonus', value: 0.25 },
        image: {
            '10': 'assets/profession/Botaniste_I.avif',
            '20': 'assets/profession/Botaniste_II.avif',
            '30': 'assets/profession/Botaniste_III.avif',
        },
    },
    {
        name: 'Alchimiste',
        index: 5,
        level: 1,
        xp: 0,
        description:
            'Collecter les ames des monstres pourrez vous donnez un éclair de génie',
        value: { stat: 'lootNormalBonus', value: 0.2 },
        image: {
            '10': 'assets/profession/Alchimie_I.png',
            '20': 'assets/profession/Alchimie_II.png',
            '30': 'assets/profession/Alchimie_II.png',
        },
    },
    {
        name: 'Necromancien',
        index: 6,
        level: 1,
        xp: 0,
        description:
            'Collecter des ames enchanter pourrez vous donnez un éclair de genie',
        value: { stat: 'lootEnchantedBonus', value: 0.2 },
        image: {
            '10': 'assets/profession/Necromancien_I.png',
            '20': 'assets/profession/Necromancien_II.png',
            '30': 'assets/profession/Necromancien_II.png',
        },
    },
    {
        name: 'Pisteur',
        index: 7,
        level: 1,
        xp: 0,
        description:
            "Trouver des monstres ou des tresors sur la carte vous donnera de l'xp",
        color: '#ffff00',
        value: { stat: 'findingPercentage', value: 0.05 },
        image: {
            '10': 'assets/profession/detective_I.png',
            '20': 'assets/profession/detective_I_II.png',
            '30': 'assets/profession/detective_I_III.png',
        },
    },
];
