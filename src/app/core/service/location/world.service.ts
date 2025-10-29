import { inject, Injectable } from '@angular/core';
import { BroadcastService } from '../Ui/broadcast.service';
import { WorldController } from 'src/app/database/world/world.controller';
import {
    BehaviorSubject,
    concat,
    concatMap,
    concatWith,
    map,
    of,
    tap,
} from 'rxjs';
import { World } from 'src/app/database/world/world.type';
import { RegionManagerService } from './region.service';
import { RelicManagerService } from '../player/relic-manager.service';
import { EggManagerService } from '../monster/egg-manager.service';

@Injectable({
    providedIn: 'root',
})
export class WorldManagerService {
    broadcastMessageService = inject(BroadcastService);
    worldControllerService = inject(WorldController);
    relicManagerService = inject(RelicManagerService);
    eggManager = inject(EggManagerService);
    regionService = inject(RegionManagerService);

    private _world$!: BehaviorSubject<World>;

    get world() {
        return this._world$.value;
    }

    get world$() {
        if (!this._world$) return of(null);
        return this._world$.asObservable();
    }

    init$() {
        return this.worldControllerService.get().pipe(
            tap((world) => (this._world$ = new BehaviorSubject(world))),
            map(() => void 0)
        );
    }

    addNextRegion$() {
        const newRegionList = this.world.regionUnlocked;
        newRegionList.push('forest');
        this.worldControllerService
            .update(this.world.id, {
                regionUnlocked: newRegionList,
            })
            .subscribe((world) => this._world$.next(world));
    }

    evolve(level: number) {
        switch (level) {
            case 2:
                this.broadcastMessageService.displayMessage({
                    message: 'Word is evolving, monster are born',
                });
                this.regionService
                    .updateSelectedRegionMonsterSpawnRate$(2 / 50)
                    .pipe(
                        concatMap(() =>
                            this.regionService.updateSelectedRegionMonsterChestRate$(
                                1
                            )
                        ),
                        concatMap(() => this.level2$())
                    )
                    .subscribe();
                break;
            case 3:
                this.enableSkillTree();
                this.levelUp$().subscribe();
                this.broadcastMessageService.displayMessage({
                    message: 'Skill tree is now available',
                });
                break;
            case 4:
                this.broadcastMessageService.displayMessage({
                    message: 'keep the good work, world power is growing',
                });
                this.levelUp$().subscribe();
                break;
            case 5:
                this.enableOffrande();
                this.broadcastMessageService.displayMessage({
                    message: 'Gods want to talk with you',
                });
                this.levelUp$().subscribe();
                break;
            case 6:
                this.enableWorldMap();
                this.broadcastMessageService.displayMessage({
                    message: 'The world is bigger than you think',
                });
                this.levelUpAfter5$().subscribe();
                break;
            case 7:
                this.enableIncubateur();
                this.broadcastMessageService.displayMessage({
                    message:
                        'You should find some egg, you could probably incube them',
                });
                this.levelUpAfter5$().subscribe();
                break;
            case 8:
                this.broadcastMessageService.displayMessage({
                    message: 'Got one egg look at incubateur',
                });
                this.eggManager.addOneRandomEgg$().subscribe();
                this.levelUpAfter5$().subscribe();
                break;
            default:
                this.levelUpAfter5$().subscribe();
        }
    }

    enableSkillTree() {
        this.worldControllerService
            .update(this.world.id, {
                skillTreeAvailable: true,
            })
            .subscribe((world) => this._world$.next(world));
    }

    enableIncubateur() {
        this.worldControllerService
            .update(this.world.id, {
                incubateurAvailable: true,
            })
            .subscribe((world) => this._world$.next(world));
    }

    enableOffrande() {
        this.worldControllerService
            .update(this.world.id, {
                offrandeAvailable: true,
            })
            .subscribe((world) => this._world$.next(world));
    }

    enableWorldMap() {
        this.worldControllerService
            .update(this.world.id, {
                worldMapAvailable: true,
            })
            .subscribe((world) => this._world$.next(world));
    }

    private levelUp$() {
        return concat(
            this.regionService.updateSelectedRegionMonsterSpawnRate$(1 / 40),
            this.regionService.updateSelectedRegionMonsterChestRate$(1 / 100),
            this.worldControllerService
                .update(this.world.id, {
                    monsterLevel: this.world.monsterLevel + 2,
                })
                .pipe(tap((world) => this._world$.next(world)))
        );
    }

    private levelUpAfter5$() {
        return concat(
            this.regionService.updateSelectedRegionMonsterSpawnRate$(1 / 40),
            this.regionService.updateSelectedRegionMonsterChestRate$(1 / 100),
            this.regionService.updateSelectedRegionEggSpawnRate$(1 / 518400),
            this.worldControllerService
                .update(this.world.id, {
                    monsterLevel: this.world.monsterLevel + 2,
                })
                .pipe(tap((world) => this._world$.next(world)))
        );
    }

    private level2$() {
        return concat(
            this.regionService.updateSelectedRegionMonsterSpawnRate$(1 / 40),
            this.regionService.updateSelectedRegionMonsterChestRate$(1 / 100),
            this.worldControllerService
                .update(this.world.id, {
                    monsterLevel: this.world.monsterLevel + 2,
                    regionAvailable: true,
                    relicAvailable: true,
                    bestiaryAvailable: true,
                    monsterAvailable: true,
                })
                .pipe(tap((world) => this._world$.next(world)))
        );
    }

    firstRelicOpened() {
        if (this.world.firstRelicDroppped) return;
        this.regionService
            .updateSelectedRegionMonsterChestRate$(-0.9)
            .subscribe();
        this.worldControllerService
            .update(this.world.id, {
                firstRelicDroppped: true,
            })
            .subscribe((world) => this._world$.next(world));
    }
}
