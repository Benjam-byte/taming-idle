import { inject, Injectable, signal } from '@angular/core';
import { RegionManagerService } from './region.service';
import { ProfessionManagerService } from '../player/profession-manager.service';

type MapKey = 'tresor' | 'monster' | 'empty';
type Direction = 'top' | 'right' | 'left';

@Injectable({
    providedIn: 'root',
})
export class MapManagerService {
    regionManagerService = inject(RegionManagerService);
    professionManagerService = inject(ProfessionManagerService);
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
        const wasMonster = this.map().map !== 'empty';
        this.availableMap.set({
            right: this.getRandomMap(wasMonster),
            left: this.getRandomMap(wasMonster),
            top: this.getRandomMap(wasMonster),
        });
        console.log(this.availableMap());
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
        if (wasMonster) return this.regionManagerService.getChestMapDict();
        return this.regionManagerService.getSelectedRegionMapDict();
    }

    private updatePisteur(map: MapKey) {
        if (map === 'empty') return;
        this.professionManagerService.updateByProfessionName('Pisteur');
    }
}
