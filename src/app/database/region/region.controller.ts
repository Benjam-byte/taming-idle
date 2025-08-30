import { inject, Injectable } from '@angular/core';
import { concatMap, forkJoin, from, Observable } from 'rxjs';
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
          lootDropPercentage: 0,
          shinyLootDropPercentage: 0,
          monsterWithTresorDropPercentage: 0,
          monsterSpawnRate: 0,
          shinyMonsterSpawnRate: 0,
          monsterEggDropPercentage: 0,
          tresorMapSpawnRate: 0,
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

  getAll(): Observable<Region[]> {
    return this.service.list();
  }

  updateOne(id: string, region: Region): Observable<Region> {
    return this.service.update(id, region);
  }

  delete(id: string): Observable<boolean> {
    return this.service.remove(id);
  }
}
