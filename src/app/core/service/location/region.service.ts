import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, of } from 'rxjs';
import { RegionController } from 'src/app/database/region/region.controller';
import { MapKey, Region } from 'src/app/database/region/region.type';

@Injectable({
  providedIn: 'root',
})
export class RegionService {
  regionControllerService = inject(RegionController);

  private _region$!: BehaviorSubject<Region>;

  constructor() {
    this.regionControllerService
      .getSelected()
      .pipe(filter((region) => !!region))
      .pipe(map((region) => (this._region$ = new BehaviorSubject(region))))
      .subscribe();
  }

  get region() {
    return this._region$.value;
  }

  get region$() {
    if (!this._region$) return of(null);
    return this._region$.asObservable();
  }

  getSelectedRegionMapDict(): Record<MapKey, number> {
    return {
      tresor: this.region.tresorMapSpawnRate,
      monster: this.region.monsterSpawnRate,
      empty:
        1 - (this.region.tresorMapSpawnRate + this.region.monsterSpawnRate),
    };
  }

  updateSelectedRegionMonsterSpawnRate(value: number) {
    this.regionControllerService
      .updateOne(this.region.id, {
        monsterSpawnRate: this.region.monsterSpawnRate + value,
      })
      .subscribe((region) => this._region$.next(region));
  }

  updateSelectedRegionLootDropPercentage(value: number) {
    this.regionControllerService
      .updateOne(this.region.id, {
        lootDropPercentage: this.region.lootDropPercentage + value,
      })
      .subscribe((region) => this._region$.next(region));
  }

  updateSelectedRegionShinyLootDropPercentage(value: number) {
    this.regionControllerService
      .updateOne(this.region.id, {
        shinyLootDropPercentage: this.region.shinyLootDropPercentage + value,
      })
      .subscribe((region) => this._region$.next(region));
  }
}
