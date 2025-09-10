import { inject, Injectable } from '@angular/core';
import { ProfessionManagerService } from './profession-manager.service';
import { LootController } from 'src/app/database/loot/loot.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Loot } from 'src/app/database/loot/loot.type';
import { RegionService } from '../location/region.service';
import { rateLinear } from '../../helpers/rate-function';
import { stochasticRound } from '../../helpers/rounding-function';

@Injectable({ providedIn: 'root' })
export class LootManagerService {
  lootControllerService = inject(LootController);
  professionManagerService = inject(ProfessionManagerService);
  regionService = inject(RegionService);

  private _loot$!: BehaviorSubject<Loot>;

  constructor() {
    this.lootControllerService
      .get()
      .pipe(map((loot) => (this._loot$ = new BehaviorSubject(loot))))
      .subscribe();
  }

  get loot() {
    return this._loot$.value;
  }

  get loot$() {
    if (!this._loot$) return of(null);
    return this._loot$.asObservable();
  }

  getLootValue() {
    return stochasticRound(
      rateLinear(1, this.regionService.region.lootDropPercentage)
    );
  }

  addWheat(wheat: number) {
    this.lootControllerService
      .update(this.loot.id, {
        wheatQuantity: wheat + this.loot.wheatQuantity,
      })
      .subscribe((loot) => {
        this._loot$.next(loot);
        this.professionManagerService.updateByProfessionName('Fermier');
      });
  }

  paidWheat$(wheat: number) {
    if (this.loot.wheatQuantity - wheat < 0) return;
    return this.lootControllerService
      .update(this.loot.id, {
        wheatQuantity: this.loot.wheatQuantity - wheat,
      })
      .pipe(
        tap((loot) => {
          this._loot$.next(loot);
        })
      );
  }
}
