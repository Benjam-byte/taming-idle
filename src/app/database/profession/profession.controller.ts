import { inject, Injectable } from '@angular/core';
import { concatMap, forkJoin, from, Observable, toArray } from 'rxjs';
import { ProfessionService } from './profession.service';
import { Profession } from './profession.type';
import professionList from '../../core/json/professionJson copy.json';

@Injectable({ providedIn: 'root' })
export class ProfessionController {
  service = inject(ProfessionService);

  init() {
    return from(professionList).pipe(
      concatMap((profession) => this.create(profession))
    );
  }

  create(profession: Omit<Profession, 'id'>): Observable<Profession> {
    return this.service.create(profession);
  }

  get(professionName: string): Observable<Profession | undefined> {
    return this.service.findByName(professionName);
  }

  getAll(): Observable<Profession[]> {
    return this.service.list();
  }

  updateOne(id: string, profession: Profession): Observable<Profession> {
    return this.service.update(id, profession);
  }

  delete(id: string): Observable<boolean> {
    return this.service.remove(id);
  }
}
