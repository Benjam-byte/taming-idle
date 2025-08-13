import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LootService } from './loot.service';
import { Loot } from './loot.type';

@Injectable({ providedIn: 'root' })
export class LootController {
  service = inject(LootService);

  create(loot: Omit<Loot, 'id'>): Observable<Loot> {
    return this.service.create(loot);
  }

  get(): Observable<Loot | undefined> {
    return this.service.get();
  }

  update(id: string, loot: Loot): Observable<Loot> {
    return this.service.update(id, loot);
  }
}
