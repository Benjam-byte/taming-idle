import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CombatTowerService } from './combatTower.service';
import { CombatTower } from './combatTower.type';

@Injectable({ providedIn: 'root' })
export class CombatTowerController {
  service = inject(CombatTowerService);

  create(combatTower: Omit<CombatTower, 'id'>): Observable<CombatTower> {
    return this.service.create(combatTower);
  }

  get(): Observable<CombatTower | undefined> {
    return this.service.get();
  }

  update(id: string, combatTower: CombatTower): Observable<CombatTower> {
    return this.service.update(id, combatTower);
  }
}
