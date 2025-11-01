export const statIconDict: Record<StatKey, string> = {
    damage: 'assets/icon/stat/damage.png',
    lootNormalBonus: 'assets/icon/stat/soul.png',
    lootEnchantedBonus: 'assets/icon/stat/enchantedSoul.png',
    travellingSpeed: 'assets/icon/footsteps.png',
    fightingSpeed: 'assets/icon/stat/fighting-speed.png',
    searchingSpeed: 'assets/icon/loupe.png',
    findingPercentage: 'assets/icon/loupe.png',
    lockPickingSpeed: 'assets/icon/stat/lock.png',
    gatherNormalBonus: 'assets/icon/stat/gathering.png',
    gatherEnchantedBonus: 'assets/icon/stat/enchantedgathering.png',
    attackSpe: 'assets/icon/stat/attack-spé.png',
    defense: 'assets/icon/stat/defense.png',
    defenseSpe: 'assets/icon/stat/defense-spe.png',
    precision: 'assets/icon/stat/precision.png',
    critique: 'assets/icon/stat/luck.png',
    monsterRate: 'assets/icon/stat/monster.png',
    enchantedMonsterRate: 'assets/icon/stat/enchantedMonster.png',
    eggRate: 'assets/icon/stat/egg.png',
};

export type StatKey =
    | 'monsterRate'
    | 'enchantedMonsterRate'
    | 'eggRate'
    | 'damage'
    | 'attackSpe'
    | 'defense'
    | 'defenseSpe'
    | 'precision'
    | 'critique'
    | 'lootNormalBonus'
    | 'travellingSpeed'
    | 'fightingSpeed'
    | 'searchingSpeed'
    | 'findingPercentage'
    | 'lockPickingSpeed'
    | 'gatherNormalBonus'
    | 'lootEnchantedBonus'
    | 'gatherEnchantedBonus';
