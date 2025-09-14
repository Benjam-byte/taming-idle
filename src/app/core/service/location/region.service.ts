import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, of, tap } from 'rxjs';
import { RegionController } from 'src/app/database/region/region.controller';
import { Region } from 'src/app/database/region/region.type';

@Injectable({
  providedIn: 'root',
})
export class RegionManagerService {
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

  getChestMapDict(): Record<string, number> {
    return {
      tresor: this.region.tresorMapSpawnRate,
      empty: 1 - this.region.monsterSpawnRate,
    };
  }

  getSelectedRegionMapDict(): Record<string, number> {
    return {
      monster: this.region.monsterSpawnRate,
      empty: 1 - this.region.monsterSpawnRate,
    };
  }

  updateSelectedRegionChestSpawnRate$(value: number) {
    return this.regionControllerService
      .updateOne(this.region.id, {
        tresorMapSpawnRate: this.region.tresorMapSpawnRate + value,
      })
      .pipe(tap((region) => this._region$.next(region)));
  }

  updateSelectedRegionMonsterSpawnRate$(value: number) {
    return this.regionControllerService
      .updateOne(this.region.id, {
        monsterSpawnRate: this.region.monsterSpawnRate + value,
      })
      .pipe(tap((region) => this._region$.next(region)));
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
