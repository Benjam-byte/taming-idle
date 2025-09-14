import { inject, Injectable } from '@angular/core';
import { BestiaryController } from 'src/app/database/bestiary/bestiary.controller';
import { MonsterProfile } from 'src/app/database/bestiary/bestiary.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import Monster from '../../value-object/monster';
import { RegionManagerService } from '../location/region.service';

@Injectable({
    providedIn: 'root',
})
export class BestiaryManagerService {
    bestiaryController = inject(BestiaryController);
    regionManagerService = inject(RegionManagerService);

    private _bestiaryList$!: BehaviorSubject<MonsterProfile[]>;

    get bestiaryList() {
        return this._bestiaryList$.value;
    }

    get bestiaryList$() {
        if (!this._bestiaryList$) return of(null);
        return this._bestiaryList$.asObservable();
    }

    get monster() {
        const monsterList = this.getMonsterFromExistingList(
            this.regionManagerService.region.existingMonsterType
        );
        const monster = this.getMonsterToInvokeFromMonsterList(monsterList);
        if (!monster) throw new Error('monster introuvable');
        return new Monster(monster);
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

    getMonsterToInvokeFromMonsterList(
        monsterList: MonsterProfile[]
    ): MonsterProfile | null {
        if (monsterList.length === 0) return null;
        const totalWeight = monsterList.reduce(
            (sum, e) => sum + e.apparitionProbability,
            0
        );
        if (totalWeight === 0) return null;
        const r = Math.random() * totalWeight;
        let cumulative = 0;
        for (const monster of monsterList) {
            cumulative += monster.apparitionProbability;
            if (r < cumulative) return monster;
        }
        return monsterList[monsterList.length - 1];
    }

    getMonsterFromExistingList(existingMonsterType: string[]) {
        return this.bestiaryList.filter((monster) =>
            existingMonsterType.includes(monster.name)
        );
    }
}
