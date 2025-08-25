import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CombatTowerService } from './combatTower.service';
import { CombatTower } from './combatTower.type';
import Monster from 'src/app/core/value-object/monster';

const defaultCombatTower = {
  level: 1,
  boss: new Monster(5, 'slime'),
};

@Injectable({ providedIn: 'root' })
export class CombatTowerController {
  service = inject(CombatTowerService);

  init() {
    return this.service.create(defaultCombatTower);
  }

  get(): Observable<CombatTower | undefined> {
    return this.service.get();
  }

  update(id: string, combatTower: CombatTower): Observable<CombatTower> {
    return this.service.update(id, combatTower);
  }
}
