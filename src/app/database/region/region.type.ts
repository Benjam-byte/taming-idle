export type MapKey = 'tresor' | 'monster' | 'empty';

export type Region = {
    id: string;
    name: string;
    isSelected: boolean;
    assignedMonsterId: string;
    savageMonsterLevel: number;
    monsterSpawnRate: number;
    enchantedMonsterRate: number;
    existingMonsterType: string[];
    monsterWithTresorDropPercentage: number;
    tresorMapSpawnRate: number;
    highQualityChest: number;
    resourceQuantity: number;
    enchantedResource: number;
    monsterResourceQuantity: number;
    enchantedMonsterResource: number;
    eggSpawnRate: number;
    monsterEggProbability: { 1: number; 2: number; 3: number };
};
