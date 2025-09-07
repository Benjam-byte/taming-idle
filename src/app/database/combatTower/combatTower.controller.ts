import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CombatTowerService } from './combatTower.service';
import { CombatTower } from './combatTower.type';

const defaultCombatTower: Omit<CombatTower, 'id'> = {
  level: 1,
  boss: { life: 5, type: 'slime', duration: 10000 },
};

@Injectable({ providedIn: 'root' })
export class CombatTowerController {
  service = inject(CombatTowerService);

  init() {
    return this.service.create(defaultCombatTower);
  }

  get(): Observable<CombatTower> {
    return this.service.get();
  }

  update(
    id: string,
    combatTower: Partial<Omit<CombatTower, 'id'>>
  ): Observable<CombatTower> {
    return this.service.update(id, combatTower);
  }
}
