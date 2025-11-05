import { inject, Injectable } from '@angular/core';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { TamedMonsterController } from 'src/app/database/tamedMonster/tamed-monster.controller';
import { safeGetNumber, safeSetNumber } from '../helpers/local-storage-acces';
import { LootController } from 'src/app/database/loot/loot.controller';
import { OfflineProgressController } from 'src/app/database/offlineProgress/offline-progress.controller';

const FIX_KEY = 'fix';
const FIX_VERSION = 1.1;

@Injectable({
    providedIn: 'root',
})
export class OldVersionFixer {
    tamedMonsterController = inject(TamedMonsterController);
    lootController = inject(LootController);
    offlineController = inject(OfflineProgressController);

    fix() {
        const stored = safeGetNumber(FIX_KEY);
        if (!stored || FIX_VERSION !== stored)
            forkJoin([
                this.fixMonsterWithnegativeValue$(),
                this.conserveProgress$(),
            ]).subscribe(() => safeSetNumber(FIX_KEY, FIX_VERSION));
    }

    private conserveProgress$() {
        return forkJoin([
            this.offlineController.get(),
            this.lootController.get(),
        ]).pipe(
            switchMap(([offlineProgress, loot]) =>
                this.offlineController
                    .update(offlineProgress.id, {
                        eggProgress:
                            (loot as any)['eggProgress'] +
                            offlineProgress.eggProgress,
                    })
                    .pipe(
                        tap(() => console.log('donne:', loot)),
                        map(() => loot)
                    )
            ),
            switchMap((loot) =>
                this.lootController.update(loot.id, { eggProgress: 0 } as any)
            )
        );
    }

    private fixMonsterWithnegativeValue$() {
        return this.tamedMonsterController.getAll().pipe(
            map((tamedMonsterList) =>
                this.cleanTamedMonsterList(tamedMonsterList)
            ),
            switchMap((tamedMonsterList) =>
                this.tamedMonsterController.updateAll(tamedMonsterList)
            )
        );
    }

    private cleanTamedMonsterList(tamedMonsterList: TamedMonster[]) {
        return tamedMonsterList.map((monster) => ({
            ...monster,
            travellingSpeed: Math.abs(monster.travellingSpeed),
        }));
    }
}
