import { inject, Injectable } from '@angular/core';
import { CombatTowerController } from 'src/app/database/combatTower/combatTower.controller';
import { CombatTower } from 'src/app/database/combatTower/combatTower.type';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { WorldManagerService } from './world.service';
import TowerMonster from '../../value-object/tower-monster';

type Encounter = {
    life: number;
    type: 'slime';
    duration: number;
};

const levelDict: Record<number, Encounter> = {
    1: { life: 5, type: 'slime', duration: 10000 },
    2: { life: 15, type: 'slime', duration: 10000 },
    3: { life: 50, type: 'slime', duration: 10000 },
    4: { life: 65, type: 'slime', duration: 10000 },
    5: { life: 100, type: 'slime', duration: 10000 },
    6: { life: 150, type: 'slime', duration: 10000 },
};

@Injectable({
    providedIn: 'root',
})
export class CombatTowerManagerService {
    combatTowerController = inject(CombatTowerController);
    worldService = inject(WorldManagerService);

    private _combatTower$!: BehaviorSubject<CombatTower>;

    get combatTower() {
        return this._combatTower$.value;
    }

    get combatTower$() {
        if (!this._combatTower$) return of(null);
        return this._combatTower$.asObservable();
    }

    init$() {
        return this.combatTowerController.get().pipe(
            tap(
                (combatTower) =>
                    (this._combatTower$ = new BehaviorSubject(combatTower))
            ),
            map(() => void 0)
        );
    }

    getBoss() {
        return this.createBoss(levelDict[this.combatTower.level]);
    }

    levelUp() {
        const newLevel = this.combatTower.level + 1;
        this.combatTowerController
            .update(this.combatTower.id, {
                level: newLevel,
                boss: levelDict[newLevel],
            })
            .subscribe((combatTower) => {
                this._combatTower$.next(combatTower);
                this.worldService.evolve(combatTower.level);
            });
    }

    private createBoss(encouter: Encounter) {
        return new TowerMonster(encouter.life, encouter.type);
    }
}
