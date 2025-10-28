import { inject, Injectable } from '@angular/core';
import { BestiaryController } from 'src/app/database/bestiary/bestiary.controller';
import { MonsterProfile } from 'src/app/database/bestiary/bestiary.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { BroadcastService } from '../Ui/broadcast.service';

@Injectable({
    providedIn: 'root',
})
export class BestiaryManagerService {
    bestiaryController = inject(BestiaryController);
    broadcastService = inject(BroadcastService);

    private _bestiaryList$!: BehaviorSubject<MonsterProfile[]>;

    get bestiaryList() {
        return this._bestiaryList$.value;
    }

    get bestiaryList$() {
        if (!this._bestiaryList$) return of(null);
        return this._bestiaryList$
            .asObservable()
            .pipe(map((list) => [...list].sort((a, b) => a.index - b.index)));
    }

    init$() {
        return this.bestiaryController.getAll().pipe(
            tap(
                (bestiaryList) =>
                    (this._bestiaryList$ = new BehaviorSubject(bestiaryList))
            ),
            map(() => void 0)
        );
    }

    getMonsterByName(name: string) {
        const beast = this.bestiaryList.find(
            (monster) => monster.name === name
        );
        if (!beast) throw new Error('beast not found');
        return beast;
    }

    getMonsterFromExistingList(existingMonsterType: string[]) {
        return this.bestiaryList.filter((monster) =>
            existingMonsterType.includes(monster.name)
        );
    }

    seeMonster(id: string) {
        this.bestiaryController
            .updateOne(id, { seen: true })
            .subscribe((bestiaryList) => {
                this._bestiaryList$.next(bestiaryList);
                this.broadcastService.displayMessage({
                    message: 'Bestiaire mis à jour',
                });
            });
    }
}
