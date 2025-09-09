import { inject, Injectable } from '@angular/core';
import { GodController } from 'src/app/database/god/god.controller';
import { God } from 'src/app/database/god/god.type';
import { BehaviorSubject, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GodService {
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
}
