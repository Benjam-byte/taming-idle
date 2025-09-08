import { inject, Injectable } from '@angular/core';
import { ProfessionManagerService } from './profession-manager.service';
import { LootController } from 'src/app/database/loot/loot.controller';
import { BehaviorSubject, map, of } from 'rxjs';
import { Loot } from 'src/app/database/loot/loot.type';
@Injectable({ providedIn: 'root' })
export class LootManagerService {
  lootControllerService = inject(LootController);
  professionManagerService = inject(ProfessionManagerService);

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
    const r = Math.random();

    if (r < 0.5) {
      return 1;
    } else if (r < 0.75) {
      return 2;
    } else {
      return 3;
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
}
