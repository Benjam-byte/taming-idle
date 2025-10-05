export const statIconDict: Record<StatKey, string> = {
    damage: 'assets/icon/stat/damage.png',
    precision: 'assets/icon/stat/precision.png',
    armorPen: 'assets/icon/stat/piercing.png',
    criticalChancePercentage: 'assets/icon/stat/clover.png',
    loot: 'assets/icon/stat/piggy-bank.png',
    travellingSpeed: 'assets/icon/footsteps.png',
    fightingSpeed: 'assets/icon/sword.png',
    searchingSpeed: 'assets/icon/loupe.png',
    findingPercentage: 'assets/icon/loupe.png',
    unlockChestBonusChancePercentage: 'assets/icon/stat/lock.png',
};

export type StatKey =
    | 'damage'
    | 'precision'
    | 'armorPen'
    | 'loot'
    | 'criticalChancePercentage'
    | 'travellingSpeed'
    | 'fightingSpeed'
    | 'searchingSpeed'
    | 'findingPercentage'
    | 'unlockChestBonusChancePercentage';
