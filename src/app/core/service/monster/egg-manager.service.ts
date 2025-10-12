import { inject, Injectable } from '@angular/core';
import { EggController } from 'src/app/database/egg/egg.controller';
import { Egg } from 'src/app/database/egg/egg.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { BroadcastService } from '../Ui/broadcast.service';

@Injectable({
    providedIn: 'root',
})
export class EggManagerService {
    eggController = inject(EggController);
    broadcastService = inject(BroadcastService);

    private _eggList$!: BehaviorSubject<Egg[]>;

    get eggList() {
        return this._eggList$.value;
    }

    get eggList$() {
        if (!this._eggList$) return of(null);
        return this._eggList$
            .asObservable()
            .pipe(
                map((list) =>
                    [...list].sort(
                        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
                    )
                )
            );
    }

    init$() {
        return this.eggController.getAll().pipe(
            tap((eggList) => (this._eggList$ = new BehaviorSubject(eggList))),
            map(() => void 0)
        );
    }
}
