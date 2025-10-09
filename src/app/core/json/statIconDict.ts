export const statIconDict: Record<StatKey, string> = {
    damage: 'assets/icon/stat/damage.png',
    lootNormalBonus: 'assets/icon/stat/piggy-bank.png',
    lootEnchantedBonus: 'assets/icon/stat/cthulhu.png',
    travellingSpeed: 'assets/icon/footsteps.png',
    fightingSpeed: 'assets/icon/sword.png',
    searchingSpeed: 'assets/icon/loupe.png',
    findingPercentage: 'assets/icon/loupe.png',
    lockPickingSpeed: 'assets/icon/stat/lock.png',
    gatherNormalBonus: 'assets/icon/stat/precision.png',
    gatherEnchantedBonus: 'assets/icon/stat/forest.png',
};

export type StatKey =
    | 'damage'
    | 'lootNormalBonus'
    | 'travellingSpeed'
    | 'fightingSpeed'
    | 'searchingSpeed'
    | 'findingPercentage'
    | 'lockPickingSpeed'
    | 'gatherNormalBonus'
    | 'lootEnchantedBonus'
    | 'gatherEnchantedBonus';
