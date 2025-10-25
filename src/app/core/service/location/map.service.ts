import { inject, Injectable, signal } from '@angular/core';
import { RegionManagerService } from './region.service';
import { AssignedMonsterManagerService } from '../player/assigned-monster-manager.service';

type MapKey = 'tresor' | 'monster' | 'empty';
type Direction = 'top' | 'right' | 'left';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    regionManagerService = inject(RegionManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    map = signal<{ count: number; map: MapKey }>({ count: 0, map: 'empty' });
    availableMap = signal<Record<Direction, MapKey>>({
        right: 'empty',
        top: 'empty',
        left: 'empty',
    });

    constructor() {}

    travelRandom() {
        const map = this.availableMap()[this.getRandomDirection()];
        const count = this.map().count + 1;
        this.map.set({ count, map });
        this.updateAvailableMap();
    }

    travelWhere(direction: Direction) {
        const map = this.availableMap()[direction];
        this.updatePisteur(map);
        const count = this.map().count + 1;
        this.map.set({ count, map });
        this.updateAvailableMap();
    }

    updateAvailableMap() {
        this.availableMap.set({
            right: this.getRandomMap(this.map().map),
            left: this.getRandomMap(this.map().map),
            top: this.getRandomMap(this.map().map),
        });
        console.log(this.availableMap());
    }

    getRandomDirection() {
        const directionList: Direction[] = ['top', 'right', 'left'];
        const randomIndex = Math.floor(Math.random() * directionList.length);
        return directionList[randomIndex];
    }

    private getRandomMap(map: string): MapKey {
        const rand = Math.random();
        let cumulative = 0;

        for (const [key, prob] of Object.entries(this.getMapDict(map))) {
            cumulative += prob;
            if (rand < cumulative) {
                return key as MapKey;
            }
        }

        return 'empty';
    }

    private getMapDict(map: string) {
        if (map === 'monster')
            return this.regionManagerService.getChestMapDict();
        if (map === 'tresor') return 'empty';
        return this.regionManagerService.getSelectedRegionMapDict();
    }

    private updatePisteur(map: MapKey) {
        if (map === 'empty') return;
        this.assignedMonsterManager.xpByProfessionName('Pisteur');
    }
}
