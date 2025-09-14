import { inject, Injectable } from '@angular/core';
import { RelicsController } from 'src/app/database/relics/relics.controller';
import { Relics } from 'src/app/database/relics/relics.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RelicManagerService {
    relicController = inject(RelicsController);

    private _relicList$!: BehaviorSubject<Relics[]>;

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

    init$() {
        return this.relicController.getAll().pipe(
            tap(
                (relicList) =>
                    (this._relicList$ = new BehaviorSubject(relicList))
            ),
            map(() => void 0)
        );
    }

    addOneRelicByName(relicName: string, entityId: string | null) {
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

    useOneRelicByName(relicName: string, entityId: string | null) {
        const relicToUpdate = this.relicList.find(
            (relic) => relic.name === relicName
        );
        if (!relicToUpdate) return;
        this.relicController
            .updateOne(relicToUpdate.id, {
                entityId,
            })
            .subscribe((relicList) => this._relicList$.next(relicList));
    }

    getOneRelicRandomByRank(rank: number) {
        const rankRelicList = this.relicList.filter(
            (relic) => relic.rank === 1
        );
        return rankRelicList[Math.floor(Math.random() * rankRelicList.length)];
    }
}
