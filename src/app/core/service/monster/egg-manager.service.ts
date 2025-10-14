import { inject, Injectable } from '@angular/core';
import { EggController } from 'src/app/database/egg/egg.controller';
import { Egg } from 'src/app/database/egg/egg.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { BroadcastService } from '../Ui/broadcast.service';
import { RegionManagerService } from '../location/region.service';
import { roll } from '../../helpers/proba-rolls';

@Injectable({
    providedIn: 'root',
})
export class EggManagerService {
    eggController = inject(EggController);
    regionManagerService = inject(RegionManagerService);
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

    rollOneEgg(): Omit<Egg, 'id'> | null {
        const rolled = roll(this.regionManagerService.region.eggSpawnRate);
        if (rolled) return this.createOneEgg();
        return null;
    }

    addOneEgg$(egg: Omit<Egg, 'id'>) {
        return this.eggController
            .create(egg)
            .pipe(tap((loot) => this._eggList$.next(loot)));
    }

    createOneEgg(): Omit<Egg, 'id'> {
        return {
            image: 'assets/egg/slime_egg.png',
            monsterName: 'Slime',
            createdAt: new Date(),
            hatchingTime: 3600 * 6,
        };
    }
}
