import { inject, Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { TamedMonsterController } from 'src/app/database/tamedMonster/tamed-monster.controller';
import { safeGetNumber, safeSetNumber } from '../helpers/local-storage-acces';

const FIX_KEY = 'fix';
const FIX_VERSION = 1;

@Injectable({
    providedIn: 'root',
})
export class OldVersionFixer {
    tamedMonsterController = inject(TamedMonsterController);

    fix() {
        const stored = safeGetNumber(FIX_KEY);
        if (!stored || FIX_VERSION !== stored)
            this.fixMonsterWithnegativeValue();
    }

    private fixMonsterWithnegativeValue() {
        this.tamedMonsterController
            .getAll()
            .pipe(
                map((tamedMonsterList) =>
                    this.cleanTamedMonsterList(tamedMonsterList)
                ),
                switchMap((tamedMonsterList) =>
                    this.tamedMonsterController.updateAll(tamedMonsterList)
                )
            )
            .subscribe(() => safeSetNumber(FIX_KEY, FIX_VERSION));
    }

    private cleanTamedMonsterList(tamedMonsterList: TamedMonster[]) {
        return tamedMonsterList.map((monster) => ({
            ...monster,
            travellingSpeed: Math.abs(monster.travellingSpeed),
        }));
    }
}
