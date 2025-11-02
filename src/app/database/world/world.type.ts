export type availableRegion =
    | 'plaine'
    | 'volcan'
    | 'fight tower'
    | 'bermude'
    | 'wind moutain'
    | 'forest';

export type World = {
    id: string;
    regionUnlocked: availableRegion[];
    region: availableRegion;
    skillTreeAvailable: boolean;
    offrandeAvailable: boolean;
    monsterAvailable: boolean;
    metaGodAvailable: boolean;
    firstRelicDroppped: boolean;
    worldMapAvailable: boolean;
    bestiaryAvailable: boolean;
    regionAvailable: boolean;
    incubateurAvailable: boolean;
    relicAvailable: boolean;
    monsterLevel: number;
    tutoPassed: boolean;
    offlinePower: number;
    xpBoost: number;
    gisement: Gisement;
};

export type Gisement = {
    life: number;
    cooldownMs: number;
    nextAvailableAt: number;
    lastHarvestAt: number;
};
