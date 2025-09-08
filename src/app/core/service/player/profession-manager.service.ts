import { inject, Injectable } from '@angular/core';
import { ProfessionController } from 'src/app/database/profession/profession.controller';
import { BehaviorSubject, map, take } from 'rxjs';
import { Profession } from 'src/app/database/profession/profession.type';
import { BroadcastService } from '../Ui/broadcast.service';
import { Human } from 'src/app/database/human/human.type';
import { HumanManagerService } from './human-manager.service';
import { WorldService } from '../location/world.service';

const XP_STEP = 0.1;

@Injectable({ providedIn: 'root' })
export class ProfessionManagerService {
  professionControllerService = inject(ProfessionController);
  worldService = inject(WorldService);
  humanService = inject(HumanManagerService);
  broadcastMessageService = inject(BroadcastService);

  private _professionlist$!: BehaviorSubject<Profession[]>;

  constructor() {
    this.professionControllerService
      .getAll()
      .pipe(
        map(
          (professionList) =>
            (this._professionlist$ = new BehaviorSubject(professionList))
        )
      )
      .subscribe();
  }

  get professionList() {
    return this._professionlist$.value;
  }

  get professionList$() {
    return this._professionlist$.asObservable();
  }

  getProfessionByName(name: string) {
    return this._professionlist$.value.find(
      (profession) => profession.name === name
    );
  }

  updateByProfessionName(professionName: string) {
    if (!this.worldService.world.skillTreeAvailable) return;
    this._professionlist$
      .pipe(
        take(1),
        map((professionList) => {
          const profession = professionList.find(
            (profession) => profession.name === professionName
          );
          if (!profession) return;
          this.professionControllerService
            .updateOne(profession.id, this.progress(profession))
            .subscribe((professionList) =>
              this._professionlist$.next(professionList)
            );
        })
      )
      .subscribe();
  }

  private progress(profession: Profession) {
    const xpCap = 1 * profession.level;
    let newXp = profession.xp + XP_STEP;
    let newLevel = profession.level;
    if (newXp >= xpCap) {
      newXp = 0;
      newLevel = newLevel + 1;
      this.broadcastMessageService.displayMessage({
        message: `${profession.name} has leveled up`,
      });
      this.humanService.updateFromProfession(profession);
    }
    return { level: newLevel, xp: newXp };
  }
}
