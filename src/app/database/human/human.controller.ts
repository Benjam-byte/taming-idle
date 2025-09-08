import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HumanService } from './human.service';
import { Human } from './human.type';

const defaultHuman = {
  damage: 1,
  precison: 1,
  tacle: 1,
  armorPen: 1,
  criticalChancePercentage: 0,
  distanceTravelled: 0,
  travellingSpeed: 1000,
  fightingSpeed: 1000,
  searchingSpeed: 1000,
};

@Injectable({ providedIn: 'root' })
export class HumanController {
  service = inject(HumanService);

  init() {
    return this.service.create(defaultHuman);
  }

  get(): Observable<Human> {
    return this.service.get();
  }

  update(id: string, human: Partial<Omit<Human, 'id'>>): Observable<Human> {
    return this.service.update(id, human);
  }

  dropTable(): Observable<void> {
    return this.service.dropTable();
  }
}
