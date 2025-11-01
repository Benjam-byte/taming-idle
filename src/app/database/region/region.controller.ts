import { inject, Injectable } from '@angular/core';
import { concatMap, from, map, Observable } from 'rxjs';
import { RegionService } from './region.service';
import { Region } from './region.type';

const regionList: string[] = [
    'plaine',
    'volcan',
    'fight tower',
    'bermude',
    'wind moutain',
    'forest',
];

@Injectable({ providedIn: 'root' })
export class RegionController {
    service = inject(RegionService);

    init() {
        return from(regionList).pipe(
            concatMap((regionName) =>
                this.create({
                    name: regionName,
                    isSelected: regionName === 'plaine',
                    assignedMonsterId: 'Terra larva',
                    savageMonsterLevel: 1,
                    monsterSpawnRate: 0,
                    enchantedMonsterRate: 0,
                    existingMonsterType: ['Slime'],
                    monsterWithTresorDropPercentage: 0.05,
                    tresorMapSpawnRate: 0.01,
                    highQualityChest: 0,
                    resourceQuantity: 1,
                    enchantedResource: 0,
                    monsterResourceQuantity: 1,
                    enchantedMonsterResource: 0,
                    eggSpawnRate: 0,
                    monsterEggProbability: { 1: 1, 2: 0, 3: 0 },
                    monsterLevel: 0,
                })
            )
        );
    }

    create(region: Omit<Region, 'id'>): Observable<Region> {
        return this.service.create(region);
    }

    get(regionName: string): Observable<Region | undefined> {
        return this.service.findByName(regionName);
    }

    getSelected(): Observable<Region | undefined> {
        return this.service
            .list()
            .pipe(
                map((regionList) =>
                    regionList.find((region) => region.isSelected)
                )
            );
    }

    getAll(): Observable<Region[]> {
        return this.service.list();
    }

    updateOne(
        id: string,
        region: Partial<Omit<Region, 'id'>>
    ): Observable<Region> {
        return this.service.update(id, region);
    }

    delete(id: string): Observable<boolean> {
        return this.service.remove(id);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
