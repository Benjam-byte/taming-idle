import { ResourceType } from 'src/app/core/enum/resource.enum';
import { Function } from 'src/app/core/models/functionType';

export interface GodCost {
    function: Function;
    resource: ResourceType;
}

export interface GodGain {
    value: number | string[] | Record<number, number>[];
    stat: string;
}
export interface God {
    id: string;
    name: string;
    description: string;
    imagePath: string;
    index: number;
    level: number;
    maxLevel: number;
    cost: GodCost;
    gain: GodGain;
}
