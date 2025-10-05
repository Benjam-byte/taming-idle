import { inject, Injectable } from '@angular/core';
import { ProfessionController } from 'src/app/database/profession/profession.controller';
import { BehaviorSubject, map, of, take, tap } from 'rxjs';
import { Profession } from 'src/app/database/profession/profession.type';
import { BroadcastService } from '../Ui/broadcast.service';
import { HumanManagerService } from './human-manager.service';
import { WorldManagerService } from '../location/world.service';

const XP_STEP = 0.1;

@Injectable({ providedIn: 'root' })
export class ProfessionManagerService {
    professionControllerService = inject(ProfessionController);
    worldService = inject(WorldManagerService);
    humanService = inject(HumanManagerService);
    broadcastMessageService = inject(BroadcastService);

    private _professionlist$!: BehaviorSubject<Profession[]>;

    get professionList() {
        return this._professionlist$.value;
    }

    get professionList$() {
        if (!this._professionlist$) return of(null);
        return this._professionlist$.asObservable();
    }

    init$() {
        return this.professionControllerService.getAll().pipe(
            tap(
                (professionList) =>
                    (this._professionlist$ = new BehaviorSubject(
                        professionList
                    ))
            ),
            map(() => void 0)
        );
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
            this.humanService.updateFromProfession$(profession).subscribe();
        }
        return { level: newLevel, xp: newXp };
    }
}
