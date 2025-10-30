import { inject, Injectable } from '@angular/core';
import { EggController } from 'src/app/database/egg/egg.controller';
import { Egg } from 'src/app/database/egg/egg.type';
import { BehaviorSubject, concatMap, map, of, tap } from 'rxjs';
import { BroadcastService } from '../Ui/broadcast.service';
import { RegionManagerService } from '../location/region.service';
import { roll } from '../../helpers/proba-rolls';
import { TamedMonsterManagerService } from './tamed-monster-manager.service';
import { eggList } from '../../config/eggList';

@Injectable({
    providedIn: 'root',
})
export class EggManagerService {
    eggController = inject(EggController);
    regionManagerService = inject(RegionManagerService);
    tamedMonsterManagerService = inject(TamedMonsterManagerService);
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
            .pipe(tap((egg) => this._eggList$.next(egg)));
    }

    addOneRandomEgg$() {
        return this.eggController
            .create(this.createOneEgg())
            .pipe(tap((egg) => this._eggList$.next(egg)));
    }

    incubeEgg$(egg: Egg) {
        const availableIndex = this.getFirstIndexIncubateurAvailable();
        if (availableIndex === -1) throw new Error("Pas d'incubateur dispo");
        return this.eggController
            .updateOne(egg.id, {
                incubateur: {
                    startedAt: Date.now(),
                    index: availableIndex,
                },
            })
            .pipe(tap((egg) => this._eggList$.next(egg)));
    }

    hatch$(egg: Egg, pseudo: string) {
        return this.tamedMonsterManagerService
            .tameMonsterByMonsterName$(egg.monsterName, pseudo)
            .pipe(
                concatMap(() =>
                    this.eggController
                        .delete(egg.id)
                        .pipe(tap((egg) => this._eggList$.next(egg)))
                )
            );
    }

    private createOneEgg(): Omit<Egg, 'id'> {
        return eggList[
            this.pickEggIndex(
                this.regionManagerService.region.monsterEggProbability
            ) - 1
        ];
    }

    private getFirstIndexIncubateurAvailable(): number {
        const incubedEggList = this.eggList.filter(
            (egg) => egg.incubateur !== null
        );
        if (incubedEggList.length === 0) return 0;
        const isIncubateurTakenList = [false, false, false];
        incubedEggList.forEach((egg) => {
            const incubateur = egg.incubateur;
            if (!incubateur) return;
            isIncubateurTakenList[incubateur.index] = true;
        });
        return isIncubateurTakenList.findIndex((v) => v === false);
    }

    private pickEggIndex(prob: { 1: number; 2: number; 3: number }): number {
        const rand = Math.random();
        let cumulative = 0;

        for (const key of Object.keys(
            prob
        ) as unknown as (keyof typeof prob)[]) {
            cumulative += prob[key];
            if (rand < cumulative) {
                return Number(key);
            }
        }

        return 3;
    }
}
