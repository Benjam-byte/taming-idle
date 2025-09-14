import { inject, Injectable } from '@angular/core';
import { ProfessionManagerService } from './profession-manager.service';
import { LootController } from 'src/app/database/loot/loot.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Loot } from 'src/app/database/loot/loot.type';
import { RegionManagerService } from '../location/region.service';
import { rateLinear } from '../../helpers/rate-function';
import { stochasticRound } from '../../helpers/rounding-function';
import { rollWithBonus } from '../../helpers/proba-rolls';
import { RelicManagerService } from './relic-manager.service';
import { WorldService } from '../location/world.service';

@Injectable({ providedIn: 'root' })
export class LootManagerService {
  lootControllerService = inject(LootController);
  relicManagerService = inject(RelicManagerService);
  professionManagerService = inject(ProfessionManagerService);
  worldManagerService = inject(WorldService);
  regionManagerService = inject(RegionManagerService);

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
      rateLinear(1, this.regionManagerService.region.lootDropPercentage)
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

  addLootFromMonsterKilled(type: string, lootObject: Record<string, number>) {
    switch (type) {
      case 'slime':
        this.lootControllerService
          .update(this.loot.id, {
            slimeSoul:
              rollWithBonus(lootObject['slimeSoulPercentage']) +
              this.loot.slimeSoul,
            enchantedSlimeSoul:
              rollWithBonus(lootObject['shinySlimeSoulPercentage']) +
              this.loot.enchantedSlimeSoul,
          })
          .subscribe((loot) => {
            this._loot$.next(loot);
          });
        break;
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

  updateChestCount() {
    this.lootControllerService
      .update(this.loot.id, {
        openedChest: this.loot.openedChest + 1,
      })
      .subscribe((loot) => {
        this._loot$.next(loot);
      });
  }

  lootChest(loot: string): string {
    if (!this.worldManagerService.world.metaGodAvailable) loot = 'relicRank1';
    if (this.loot.openedChest === 0) this.firstOpenedChest();
    this.updateChestCount();
    switch (loot) {
      case 'relicRank1': {
        const newRelic = this.relicManagerService.getOneRelicRandomByRank(1);
        this.relicManagerService.addOneRelicByName(newRelic.name, null);
        return newRelic.name;
      }
      case 'glitchedStone':
        return '1 glitched stone';
    }
    return 'une erreur avec ce coffre';
  }

  private firstOpenedChest() {
    this.regionManagerService.updateSelectedRegionChestSpawnRate$(0.1);
  }
}
