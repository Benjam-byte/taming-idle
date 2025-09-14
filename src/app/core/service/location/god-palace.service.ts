import { inject, Injectable } from '@angular/core';
import { GodController } from 'src/app/database/god/god.controller';
import { God } from 'src/app/database/god/god.type';
import { BehaviorSubject, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GodPalaceManagerService {
  godController = inject(GodController);

  private _godList$!: BehaviorSubject<God[]>;

  constructor() {
    this.godController
      .getAll()
      .pipe(map((godList) => (this._godList$ = new BehaviorSubject(godList))))
      .subscribe();
  }

  get godList() {
    return this._godList$.value;
  }

  get godList$() {
    if (!this._godList$) return of(null);
    return this._godList$.asObservable();
  }

  updateGodLevel(god: God) {
    this.godController
      .updateOne(god.id, { level: god.level + 1 })
      .subscribe((godList) => this._godList$.next(godList));
  }
}
