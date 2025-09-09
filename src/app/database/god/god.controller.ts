import { inject, Injectable } from '@angular/core';
import { concatMap, from, map, Observable } from 'rxjs';
import { GodService } from './god.service';
import { God } from './god.type';
import godList from '../../core/json/godJson.json';

@Injectable({ providedIn: 'root' })
export class GodController {
  service = inject(GodService);

  init() {
    return from(godList).pipe(concatMap((god) => this.create(god)));
  }

  create(god: Omit<God, 'id'>): Observable<God> {
    return this.service.create(god);
  }

  get(godName: string): Observable<God | undefined> {
    return this.service.findByName(godName);
  }

  getAll(): Observable<God[]> {
    return this.service
      .list()
      .pipe(map((godList) => godList.sort((a, b) => a.order - b.order)));
  }

  updateOne(id: string, god: Partial<Omit<God, 'id'>>): Observable<God[]> {
    return this.service.update(id, god);
  }

  delete(id: string): Observable<boolean> {
    return this.service.remove(id);
  }

  dropTable(): Observable<void> {
    return this.service.dropTable();
  }
}
