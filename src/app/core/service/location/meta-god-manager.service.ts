import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, concatMap, forkJoin, map, of, tap } from 'rxjs';
import { BroadcastService } from '../Ui/broadcast.service';
import { MetaGodOption } from 'src/app/database/meta-god/meta-god.type';
import { MetaGodController } from 'src/app/database/meta-god/meta-god.controller';
import { RegionManagerService } from './region.service';
import { WorldManagerService } from './world.service';
import { LootManagerService } from '../player/loot-manager.service';

@Injectable({
    providedIn: 'root',
})
export class MetaGodPowerManagerService {
    metaGodController = inject(MetaGodController);
    broadcastService = inject(BroadcastService);
    regionManager = inject(RegionManagerService);
    worldManager = inject(WorldManagerService);
    lootManager = inject(LootManagerService);

    private _metaGodPowerList$!: BehaviorSubject<MetaGodOption[]>;

    get metaGodPowerList() {
        return this._metaGodPowerList$.value;
    }

    get metaGodPowerList$() {
        if (!this._metaGodPowerList$) return of(null);
        return this._metaGodPowerList$.asObservable();
    }

    init$() {
        return this.metaGodController.getAll().pipe(
            tap(
                (metaGodPowerList) =>
                    (this._metaGodPowerList$ = new BehaviorSubject(
                        metaGodPowerList
                    ))
            ),
            map(() => void 0)
        );
    }

    levelUpPower$(power: MetaGodOption) {
        return this.lootManager
            .paidGlitchedStone$(power.cost[power.level])
            .pipe(
                concatMap(() =>
                    forkJoin([
                        this.metaGodController
                            .update(power.id, {
                                level: power.level + 1,
                            })
                            .pipe(
                                tap((powerList) =>
                                    this._metaGodPowerList$.next(powerList)
                                )
                            ),
                        this.updateGainPower$(power),
                    ])
                )
            );
    }

    levelUpPowerByName$(name: string) {
        const power = this.getPowerByName(name);
        return this.metaGodController
            .update(power.id, {
                level: power.level + 1,
            })
            .pipe(tap((powerList) => this._metaGodPowerList$.next(powerList)));
    }

    getPowerByName(name: string) {
        const power = this.metaGodPowerList.find(
            (power) => power.name === name
        );
        if (!power) throw new Error('Power not found');
        return power;
    }

    updateGainPower$(power: MetaGodOption) {
        switch (power.name) {
            case 'Offline Boost':
                return this.worldManager.updateOfflinePower$();
            case 'XP Collector':
                return this.worldManager.updateXpBoost$();
            case 'Apparition de coffres':
                return this.regionManager.updateSelectedRegionChestSpawnRate$(
                    0.05
                );
            case 'Plus d’œufs':
                return this.regionManager.updateSelectedRegionEggSpawnRate$(
                    1 / 518400
                );
            default:
                return of();
        }
    }
}
