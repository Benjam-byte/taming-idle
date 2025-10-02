export const professionList = [
    {
        name: 'Voleur',
        level: 1,
        xp: 0,
        description:
            'Crocheter un coffre, commettre un mefait pourrez vous donnez un éclair de génie',
        color: '#ffff00',
        bonus: '+2% de chance de crocheter',
        value: { stat: 'fightingSpeed', value: 0.2 },
        image: {
            '10': 'assets/profession/Voleur_I.avif',
            '20': 'assets/profession/Voleur_II.avif',
            '30': 'assets/profession/Voleur_III.avif',
        },
    },
    {
        name: 'Botaniste',
        level: 1,
        xp: 0,
        description: "Ramasser une plante rare c'est vraiment super",
        color: '#ffff00',
        bonus: '+2% de chance de crocheter',
        value: { stat: 'fightingSpeed', value: 0.2 },
        image: {
            '10': 'assets/profession/Botaniste_I.avif',
            '20': 'assets/profession/Botaniste_II.avif',
            '30': 'assets/profession/Botaniste_III.avif',
        },
    },
    {
        name: 'Fermier',
        level: 1,
        xp: 0,
        description:
            'Collecter du blé, planter un arbre pourrez vous donnez un éclair de génie',
        color: '#008000',
        bonus: '+2% de recolte',
        value: { stat: 'loot', value: 0.2 },
        image: {
            '10': 'assets/profession/Paysan_I.avif',
            '20': 'assets/profession/Paysan_II.avif',
            '30': 'assets/profession/Paysan_III.avif',
        },
    },
    {
        name: 'Pisteur',
        level: 1,
        xp: 0,
        description:
            "Trouver des monstres ou des tresors sur la carte vous donnera de l'xp",
        color: '#ffff00',
        bonus: "+2% de chance d'indication",
        value: { stat: 'findingPercentage', value: 0.2 },
        image: {
            '10': 'assets/profession/detective_I.png',
            '20': 'assets/profession/detective_I_II.png',
            '30': 'assets/profession/detective_I_III.png',
        },
    },
    {
        name: 'Voyageur',
        level: 1,
        xp: 0,
        description:
            'Se promener, se deplacer dans les dimensions pourrez vous donnez un éclair de génie',
        color: '#800080',
        bonus: '+2% de vitesse de deplacement',
        value: { stat: 'travellingSpeed', value: -100 },
        image: {
            '10': 'assets/profession/Traveler_I.avif',
            '20': 'assets/profession/Traveler_II.avif',
            '30': 'assets/profession/Traveler_III.avif',
        },
    },
    {
        name: 'Guerrier',
        level: 1,
        xp: 0,
        description:
            "Se battre peu importe l'endroit pourrez vous donnez un éclair de génie",
        color: '#0000ff',
        bonus: '+2 de degat',
        value: { stat: 'damage', value: 2 },
        image: {
            '10': 'assets/profession/Guerrier_I.avif',
            '20': 'assets/profession/Guerrier_II.avif',
            '30': 'assets/profession/Guerrier_III.avif',
        },
    },
    {
        name: 'Berserk',
        level: 1,
        xp: 0,
        description:
            'Des coups critiques pourrez vous donnez un éclair de génie',
        background: 'assets/skill-tree/skill-tree-red.png',
        color: '#ff0000',
        bonus: '+2% de chance de coup critique',
        value: { stat: 'armorPen', value: 0.2 },
        image: {
            '10': 'assets/profession/Berserk_I.avif',
            '20': 'assets/profession/Berserk_II.avif',
            '30': 'assets/profession/Berserk_II.avif',
        },
    },
];
