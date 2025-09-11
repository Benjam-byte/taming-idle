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

  getCorrectValueFromRessource$(ressource: string) {
    console.log(ressource);
    switch (ressource) {
      case 'Wheat':
        return this._loot$.pipe(map((loot) => loot.wheatQuantity));
      case 'Wheat_Shinny':
        return this._loot$.pipe(map((loot) => loot.enchantedWheatQuantity));
      case 'Soul_Slime':
        return this._loot$.pipe(map((loot) => loot.slimeSoul));
      case 'Soul_Slime_Shinny':
        return this._loot$.pipe(map((loot) => loot.enchantedSlimeSoul));
      default:
        return this._loot$.pipe(map((loot) => loot.wheatQuantity));
    }
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

  paidEnchantedWheat$(wheat: number) {
    if (this.loot.enchantedWheatQuantity - wheat < 0) return;
    return this.lootControllerService
      .update(this.loot.id, {
        enchantedWheatQuantity: this.loot.enchantedWheatQuantity - wheat,
      })
      .pipe(
        tap((loot) => {
          this._loot$.next(loot);
        })
      );
  }

  paidEnchantedSlimeSoul$(shinnySoul: number) {
    if (this.loot.enchantedSlimeSoul - shinnySoul < 0) return;
    return this.lootControllerService
      .update(this.loot.id, {
        enchantedSlimeSoul: this.loot.enchantedSlimeSoul - shinnySoul,
      })
      .pipe(
        tap((loot) => {
          this._loot$.next(loot);
        })
      );
  }

  paidSlimeSoul$(soul: number) {
    if (this.loot.slimeSoul - soul < 0) return;
    return this.lootControllerService
      .update(this.loot.id, {
        slimeSoul: this.loot.slimeSoul - soul,
      })
      .pipe(
        tap((loot) => {
          this._loot$.next(loot);
        })
      );
  }
}
