import { inject, Injectable } from '@angular/core';
import { RelicsController } from 'src/app/database/relics/relics.controller';
import { Relics } from 'src/app/database/relics/relics.type';
import { BehaviorSubject, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RelicService {
  relicController = inject(RelicsController);

  private _relicList$!: BehaviorSubject<Relics[]>;

  constructor() {
    this.relicController
      .getAll()
      .pipe(
        map((relicList) => (this._relicList$ = new BehaviorSubject(relicList)))
      )
      .subscribe();
  }

  get relicList() {
    return this._relicList$.value;
  }

  get relicList$() {
    if (!this._relicList$) return of(null);
    return this._relicList$.asObservable();
  }

  get damageFromRelic() {
    const activatedDamageRelic = this.relicList
      .filter((relic) => relic.effet.stat === 'damage')
      .filter((relic) => relic.entityId !== null);
    if (!activatedDamageRelic[0]) return 0;
    console.log(activatedDamageRelic);
    return activatedDamageRelic[0].effet.value;
  }

  addOneRelicByName(relicName: string, entityId: string) {
    const relicToUpdate = this.relicList.find(
      (relic) => relic.name === relicName
    );
    if (!relicToUpdate) return;
    this.relicController
      .updateOne(relicToUpdate.id, {
        quantity: relicToUpdate.quantity + 1,
        entityId,
      })
      .subscribe((relicList) => this._relicList$.next(relicList));
  }
}
