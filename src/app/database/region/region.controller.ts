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
                    lootDropPercentage: 0,
                    shinyLootDropPercentage: 0,
                    monsterWithTresorDropPercentage: 0,
                    monsterSpawnRate: 0,
                    shinyMonsterSpawnRate: 0,
                    monsterEggDropPercentage: 0,
                    tresorMapSpawnRate: 0,
                    existingMonsterType: ['Slime'],
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
