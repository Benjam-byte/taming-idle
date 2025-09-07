import { inject, Injectable } from '@angular/core';
import { BroadcastService } from '../Ui/broadcast.service';
import { WorldController } from 'src/app/database/world/world.controller';
import { BehaviorSubject, map } from 'rxjs';
import { World } from 'src/app/database/world/world.type';

@Injectable({
  providedIn: 'root',
})
export class WorldService {
  broadcastMessageService = inject(BroadcastService);
  worldControllerService = inject(WorldController);

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
    return this._world$.asObservable();
  }

  evolve(level: number) {
    switch (level) {
      case 1:
        this.enableMonster();
        this.broadcastMessageService.displayMessage({
          message: 'Word is evolving, monster are born',
        });
        break;
      case 2:
        this.enableSkillTree();
        this.broadcastMessageService.displayMessage({
          message: 'Skill tree is now available',
        });
        break;
      case 3:
        this.broadcastMessageService.displayMessage({
          message: 'keep the good work, world power is growing',
        });
        break;
      case 4:
        this.enableOffrande();
        this.broadcastMessageService.displayMessage({
          message: 'Gods want to talk with you',
        });
        break;
    }
  }

  enableMonster() {
    this.worldControllerService.update(this.world.id, {
      monsterAvailable: true,
    });
  }

  enableSkillTree() {
    this.worldControllerService.update(this.world.id, {
      skillTreeAvailable: true,
    });
  }

  enableOffrande() {
    this.worldControllerService.update(this.world.id, {
      offrandeAvailable: true,
    });
  }
}
