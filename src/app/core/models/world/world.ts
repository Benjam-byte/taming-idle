export type World = {
    regions: Record<RegionName, Region>
}

export const REGION_NAMES = ['Plaines'] as const;
export type RegionName = (typeof REGION_NAMES)[number];

export type Region = {}