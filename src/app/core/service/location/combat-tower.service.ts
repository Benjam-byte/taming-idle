import { inject, Injectable } from '@angular/core';
import Monster from '../../value-object/monster';
import { CombatTowerController } from 'src/app/database/combatTower/combatTower.controller';
import { CombatTower } from 'src/app/database/combatTower/combatTower.type';
import { BehaviorSubject, map } from 'rxjs';
import { WorldService } from './world.service';

type Encounter = {
  life: number;
  type: 'slime';
  duration: number;
};

const levelDict: Record<number, Encounter> = {
  1: { life: 5, type: 'slime', duration: 10000 },
  2: { life: 15, type: 'slime', duration: 10000 },
  3: { life: 25, type: 'slime', duration: 10000 },
  4: { life: 50, type: 'slime', duration: 10000 },
  5: { life: 80, type: 'slime', duration: 10000 },
};

@Injectable({
  providedIn: 'root',
})
export class CombatTowerService {
  combatTowerController = inject(CombatTowerController);
  worldService = inject(WorldService);

  private _combatTower$!: BehaviorSubject<CombatTower>;

  constructor() {
    this.combatTowerController
      .get()
      .pipe(
        map(
          (combatTower) =>
            (this._combatTower$ = new BehaviorSubject(combatTower))
        )
      )
      .subscribe();
  }

  get combatTower() {
    return this._combatTower$.value;
  }

  get combatTower$() {
    return this._combatTower$.asObservable();
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
    return new Monster(encouter.life, encouter.type);
  }
}
