import { inject, Injectable } from '@angular/core';
import { BroadcastService } from '../Ui/broadcast.service';
import { WorldController } from 'src/app/database/world/world.controller';
import { BehaviorSubject, concatWith, map, of, tap } from 'rxjs';
import { World } from 'src/app/database/world/world.type';
import { RegionManagerService } from './region.service';
import { HumanManagerService } from '../player/human-manager.service';
import { RelicManagerService } from '../player/relic-manager.service';

@Injectable({
    providedIn: 'root',
})
export class WorldManagerService {
    broadcastMessageService = inject(BroadcastService);
    worldControllerService = inject(WorldController);
    humanManagerService = inject(HumanManagerService);
    relicManagerService = inject(RelicManagerService);
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
                this.enableMonster();
                this.broadcastMessageService.displayMessage({
                    message: 'Word is evolving, monster are born',
                });
                this.regionService
                    .updateSelectedRegionMonsterSpawnRate$(2 / 50)
                    .pipe(
                        concatWith(
                            this.regionService.updateSelectedRegionMonsterChestSpawnRate$(
                                1
                            )
                        )
                    )
                    .subscribe();

                break;
            case 3:
                this.enableSkillTree();
                this.broadcastMessageService.displayMessage({
                    message: 'Skill tree is now available',
                });
                break;
            case 4:
                this.regionService.updateSelectedRegionChestSpawnRate$(0.1);
                this.broadcastMessageService.displayMessage({
                    message: 'keep the good work, world power is growing',
                });
                break;
            case 5:
                this.enableOffrande();
                this.broadcastMessageService.displayMessage({
                    message: 'Gods want to talk with you',
                });
                break;
            case 6:
                this.enableWorldMap();
                this.broadcastMessageService.displayMessage({
                    message: 'The world is bigger than you think',
                });
                break;
        }
    }

    enableMonster() {
        this.worldControllerService
            .update(this.world.id, {
                monsterAvailable: true,
            })
            .subscribe((world) => this._world$.next(world));
    }

    enableSkillTree() {
        this.worldControllerService
            .update(this.world.id, {
                skillTreeAvailable: true,
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

    firstRelicOpened() {
        if (this.world.firstRelicDroppped) return;
        this.regionService
            .updateSelectedRegionMonsterChestSpawnRate$(-0.9)
            .subscribe();
        this.worldControllerService
            .update(this.world.id, {
                firstRelicDroppped: true,
            })
            .subscribe((world) => this._world$.next(world));
    }
}
