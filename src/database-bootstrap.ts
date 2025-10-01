import { Injectable, inject, signal } from '@angular/core';
import {
    firstValueFrom,
    forkJoin,
    of,
    concat,
    defer,
    tap,
    catchError,
    lastValueFrom,
} from 'rxjs';
import { HumanController } from './app/database/human/human.controller';
import { CombatTowerController } from './app/database/combatTower/combatTower.controller';
import { LootController } from './app/database/loot/loot.controller';
import { ProfessionController } from './app/database/profession/profession.controller';
import { RegionController } from './app/database/region/region.controller';
import { WorldController } from './app/database/world/world.controller';
import { GodController } from './app/database/god/god.controller';
import { BestiaryController } from './app/database/bestiary/bestiary.controller';
import { RelicsController } from './app/database/relics/relics.controller';
import { RegionManagerService } from './app/core/service/location/region.service';
import { RelicManagerService } from './app/core/service/player/relic-manager.service';
import { BestiaryManagerService } from './app/core/service/monster/bestiary-manager.service';
import { CombatTowerManagerService } from './app/core/service/location/combat-tower.service';
import { GodPalaceManagerService } from './app/core/service/location/god-palace.service';
import { WorldManagerService } from './app/core/service/location/world.service';
import { HumanManagerService } from './app/core/service/player/human-manager.service';
import { LootManagerService } from './app/core/service/player/loot-manager.service';
import { ProfessionManagerService } from './app/core/service/player/profession-manager.service';

const DB_VERSION = 4;
const DB_KEY = 'db';

@Injectable({ providedIn: 'root' })
export class DatabaseBootstrapService {
    // CONTROLLERS
    private readonly humanControllerService = inject(HumanController);
    private readonly combatTowerControllerService = inject(
        CombatTowerController
    );
    private readonly lootControllerService = inject(LootController);
    private readonly professionControllerService = inject(ProfessionController);
    private readonly regionControllerService = inject(RegionController);
    private readonly worldControllerService = inject(WorldController);
    private readonly godControllerService = inject(GodController);
    private readonly bestiaryControllerService = inject(BestiaryController);
    private readonly relicControllerService = inject(RelicsController);

    // MANAGERS (loaded after DB is ready)
    private readonly combatTowerService = inject(CombatTowerManagerService);
    private readonly godPalaceService = inject(GodPalaceManagerService);
    private readonly regionManagerService = inject(RegionManagerService);
    private readonly worldManagerService = inject(WorldManagerService);

    private readonly bestiaryManagerService = inject(BestiaryManagerService);

    private readonly humanManagerService = inject(HumanManagerService);
    private readonly lootManagerService = inject(LootManagerService);
    private readonly professionManagerService = inject(
        ProfessionManagerService
    );
    private readonly relicManagerService = inject(RelicManagerService);

    private initDatabase$() {
        return forkJoin([
            this.humanControllerService.init(),
            this.combatTowerControllerService.init(),
            this.lootControllerService.init(),
            this.professionControllerService.init(),
            this.regionControllerService.init(),
            this.worldControllerService.init(),
            this.godControllerService.init(),
            this.bestiaryControllerService.init(),
            this.relicControllerService.init(),
        ]);
    }

    /** Your drop flow */
    private dropDatabase$() {
        return forkJoin([
            this.humanControllerService.dropTable(),
            this.combatTowerControllerService.dropTable(),
            this.lootControllerService.dropTable(),
            this.professionControllerService.dropTable(),
            this.regionControllerService.dropTable(),
            this.worldControllerService.dropTable(),
            this.godControllerService.dropTable(),
            this.bestiaryControllerService.dropTable(),
            this.relicControllerService.dropTable(),
        ]);
    }

    private loadManagerBlocking$() {
        return forkJoin([
            this.combatTowerService.init$(),
            this.godPalaceService.init$(),
            this.regionManagerService.init$(),
            this.relicManagerService.init$(),
            this.worldManagerService.init$(),
            this.bestiaryManagerService.init$(),
            this.humanManagerService.init$(),
            this.lootManagerService.init$(),
            this.professionManagerService.init$(),
        ]).pipe(
            catchError((err) => {
                // log and continue – avoid killing the app
                console.error('[Managers warmup] failed', err);
                return of(void 0);
            })
        );
    }

    /** The one entrypoint called by APP_INITIALIZER */
    async ensureInitialized(): Promise<void> {
        const stored = this.safeGetNumber(DB_KEY);

        try {
            await lastValueFrom(
                defer(() => {
                    if (stored === null) {
                        return concat(
                            this.initDatabase$(),
                            this.loadManagerBlocking$()
                        );
                    } else if (stored !== DB_VERSION) {
                        return concat(
                            this.dropDatabase$(),
                            this.initDatabase$(),
                            this.loadManagerBlocking$()
                        );
                    } else {
                        return this.loadManagerBlocking$();
                    }
                })
            );

            this.safeSetNumber(DB_KEY, DB_VERSION);
        } catch (err) {
            console.error('[DB bootstrap] failed', err);
        }
    }

    // --- small, safe LS helpers --- //
    private safeGetNumber(key: string): number | null {
        try {
            const raw = localStorage.getItem(key);
            if (raw == null) return null;
            const n = Number(raw);
            return n;
        } catch {
            return null;
        }
    }

    private safeSetNumber(key: string, value: number): void {
        try {
            localStorage.setItem(key, String(value));
        } catch {
            throw new Error('LocalStorage error');
        }
    }
}
