import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LootService } from './loot.service';
import { Loot } from './loot.type';

const defaultLoot = {
  wheatQuantity: 0,
};

@Injectable({ providedIn: 'root' })
export class LootController {
  service = inject(LootService);

  init() {
    return this.service.create(defaultLoot);
  }

  create(loot: Omit<Loot, 'id'>): Observable<Loot> {
    return this.service.create(loot);
  }

  get(): Observable<Loot> {
    return this.service.get();
  }

  update(id: string, loot: Partial<Omit<Loot, 'id'>>): Observable<Loot> {
    return this.service.update(id, loot);
  }

  dropTable(): Observable<void> {
    return this.service.dropTable();
  }
}
