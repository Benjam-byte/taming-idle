import { inject, Injectable, signal } from '@angular/core';
import { RegionManagerService } from './region.service';

type MapKey = 'tresor' | 'monster' | 'empty';
type Direction = 'top' | 'right' | 'left';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    regionService = inject(RegionManagerService);
    map = signal<{ count: number; map: MapKey }>({ count: 0, map: 'empty' });
    availableMap: Record<Direction, MapKey> = {
        right: 'empty',
        top: 'empty',
        left: 'empty',
    };

    constructor() {}

    travelRandom() {
        const map = this.availableMap[this.getRandomDirection()];
        const count = this.map().count + 1;
        this.map.set({ count, map });
        this.updateAvailableMap();
    }

    travelWhere(direction: Direction) {
        const map = this.availableMap[direction];
        const count = this.map().count + 1;
        this.map.set({ count, map });
        this.updateAvailableMap();
    }

    updateAvailableMap() {
        const wasMonster = this.map().map === 'monster';
        this.availableMap.right = this.getRandomMap(wasMonster);
        this.availableMap.left = this.getRandomMap(wasMonster);
        this.availableMap.top = this.getRandomMap(wasMonster);
    }

    getRandomDirection() {
        const directionList: Direction[] = ['top', 'right', 'left'];
        const randomIndex = Math.floor(Math.random() * directionList.length);
        return directionList[randomIndex];
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
