import { inject, Injectable } from '@angular/core';
import { GodController } from 'src/app/database/god/god.controller';
import { God } from 'src/app/database/god/god.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GodManagerService {
    godController = inject(GodController);

    private _godList$!: BehaviorSubject<God[]>;

    get godList() {
        return this._godList$.value;
    }

    get godList$() {
        if (!this._godList$) return of(null);
        return this._godList$
            .asObservable()
            .pipe(map((list) => [...list].sort((a, b) => a.index - b.index)));
    }

    init$() {
        return this.godController.getAll().pipe(
            tap((godList) => (this._godList$ = new BehaviorSubject(godList))),
            map(() => void 0)
        );
    }

    updateGodLevel(god: God) {
        this.godController
            .updateOne(god.id, { level: god.level + 1 })
            .subscribe((godList) => this._godList$.next(godList));
    }
}
