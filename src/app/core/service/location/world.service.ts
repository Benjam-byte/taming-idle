import { inject, Injectable } from '@angular/core';
import { BroadcastService } from '../Ui/broadcast.service';
import { WorldController } from 'src/app/database/world/world.controller';
import { BehaviorSubject, concatWith, map, of } from 'rxjs';
import { World } from 'src/app/database/world/world.type';
import { RegionService } from './region.service';
import { HumanManagerService } from '../player/human-manager.service';
import { RelicService } from '../player/relic-manager.service';

@Injectable({
  providedIn: 'root',
})
export class WorldService {
  broadcastMessageService = inject(BroadcastService);
  worldControllerService = inject(WorldController);
  humanManagerService = inject(HumanManagerService);
  relicManagerService = inject(RelicService);
  regionService = inject(RegionService);

  private _world$!: BehaviorSubject<World>;

  constructor() {
    this.worldControllerService
      .get()
      .pipe(map((world) => (this._world$ = new BehaviorSubject(world))))
      .subscribe();
  }

  get world() {
    return this._world$.value;
  }

  get world$() {
    if (!this._world$) return of(null);
    return this._world$.asObservable();
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
              this.regionService.updateSelectedRegionChestSpawnRate$(1)
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
}
