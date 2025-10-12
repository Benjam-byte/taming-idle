import { ResourceType } from '../enum/resource.enum';
import { Expo, Treshold } from '../models/functionType';

export const godList = [
    {
        name: "Dieu de l'aventure",
        description:
            "Le dieu de l'aventure accepte le blé, en échange il augmente la quantité de ressource dans votre monde",
        imagePath: 'assets/altar/Altar_Adventure.webp',
        index: 1,
        level: 0,
        maxLevel: 2,
        cost: {
            function: {
                name: 'treshold',
                tresholdList: [150, 200],
            } as Treshold,
            resource: ResourceType.EnchantedWheat,
        },
        gain: {
            value: ['Canard', 'Mantis'],
            stat: 'monsterEggProbability',
        },
    },
    {
        name: 'Dieu du combat',
        description:
            'Le dieu du combat accepte du blé. En échange, les monstres enchantés apparaissent plus souvent.',
        imagePath: 'assets/altar/Altar_Combat.webp',
        index: 2,
        level: 0,
        maxLevel: 10,
        cost: {
            function: {
                name: 'exp',
                parameter: {
                    a: 1,
                    b: 1.5,
                    c: 10,
                },
            } as Expo,
            resource: ResourceType.Wheat,
        },
        gain: {
            value: 0.015,
            stat: 'enchantedMonsterRate',
        },
    },
    {
        name: 'Dieu des richesses',
        description:
            'Le dieu des richesses accepte des ames de monstres enchanté. En échange, il augmente la probability de coffre de meilleur qualité.',
        imagePath: 'assets/altar/Altar_Malice.webp',
        index: 3,
        level: 0,
        maxLevel: 5,
        cost: {
            function: {
                name: 'exp',
                parameter: {
                    a: 1,
                    b: 2,
                    c: 50,
                },
            } as Expo,
            resource: ResourceType.EnchantedSoul,
        },
        gain: {
            value: 0.01,
            stat: 'highQualityChest',
        },
    },
    {
        name: 'Dieu des champs',
        description:
            'Le dieu des champs accepte des ames de monstres. En échange, il augmente la quantité de blé sur votre terrotoires.',
        imagePath: 'assets/altar/Altar_Speed.webp',
        index: 4,
        level: 0,
        maxLevel: 20,
        cost: {
            function: {
                name: 'exp',
                parameter: {
                    a: 1,
                    b: 2,
                    c: 10,
                },
            } as Expo,
            resource: ResourceType.Soul,
        },
        gain: {
            value: 0.15,
            stat: 'resourceQuantity',
        },
    },
    {
        name: 'Dieu de la magie',
        description:
            'Le dieu de la magie accepte du blé. En échange, il augmente la probabilité de trouver du blé enchanté.',
        imagePath: 'assets/altar/Altar_Speed.webp',
        index: 5,
        level: 0,
        maxLevel: 10,
        cost: {
            function: {
                name: 'exp',
                parameter: {
                    a: 1,
                    b: 2,
                    c: 50,
                },
            } as Expo,
            resource: ResourceType.Wheat,
        },
        gain: {
            value: 0.01,
            stat: 'enchantedResource',
        },
    },
    {
        name: 'Dieu de la mort',
        description:
            "Le dieu de la mort accepte du blé. En échange, il augmente la quantité de d'ames recoltables.",
        imagePath: 'assets/altar/Altar_Speed.webp',
        index: 6,
        level: 0,
        maxLevel: 10,
        cost: {
            function: {
                name: 'exp',
                parameter: {
                    a: 1,
                    b: 2,
                    c: 50,
                },
            } as Expo,
            resource: ResourceType.Wheat,
        },
        gain: {
            value: 0.15,
            stat: 'monsterResourceQuantity',
        },
    },
    {
        name: 'Dieu de la sorcellerie',
        description:
            "Le dieu de la sorcellerie accepte du blé enchanté. En échange, il augmente la quantité d'ames enchantés.",
        imagePath: 'assets/altar/Altar_Speed.webp',
        index: 7,
        level: 0,
        maxLevel: 10,
        cost: {
            function: {
                name: 'exp',
                parameter: {
                    a: 1,
                    b: 2,
                    c: 50,
                },
            } as Expo,
            resource: ResourceType.EnchantedWheat,
        },
        gain: {
            value: 0.15,
            stat: 'enchantedMonsterResource',
        },
    },
    {
        name: 'Dieu de la fécondité',
        description:
            'Le dieu de la fécondité accepte des ames enchantés. En échange, de nouvelles especes apparaissent dans votre monde.',
        imagePath: 'assets/altar/Altar_Speed.webp',
        index: 8,
        level: 0,
        maxLevel: 2,
        cost: {
            function: {
                name: 'treshold',
                tresholdList: [150, 200],
            } as Treshold,
            resource: ResourceType.EnchantedSoul,
        },
        gain: {
            value: [
                { 1: -0.1, 2: 0.1, 3: 0 },
                { 1: -0.05, 2: 0, 3: 0.05 },
            ],
            stat: 'monsterEggProbability',
        },
    },
];
