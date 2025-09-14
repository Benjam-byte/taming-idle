import { inject, Injectable, signal } from '@angular/core';
import { Map } from '../../value-object/map';
import { RegionManagerService } from './region.service';

type MapKey = 'tresor' | 'monster' | 'empty';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    regionService = inject(RegionManagerService);
    map = signal<Map>(new Map());

    constructor() {}

    changeMap() {
        const oldMap = this.map().content();
        this.map().setContent(undefined);
        const map = this.getRandomMap(oldMap === ('monster' as any));
        setTimeout(() => {
            this.map().setContent(map);
        }, 100);
    }

    private getRandomMap(wasMonster: boolean): MapKey {
        const rand = Math.random();
        let cumulative = 0;

        for (const [key, prob] of Object.entries(this.getMapDict(wasMonster))) {
            cumulative += prob;
            if (rand < cumulative) {
                return key as MapKey;
            }
        }

        return 'empty';
    }

    private getMapDict(wasMonster: boolean) {
        if (wasMonster) return this.regionService.getChestMapDict();
        return this.regionService.getSelectedRegionMapDict();
    }
}
