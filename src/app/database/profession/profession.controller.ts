import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ProfessionService } from './profession.service';
import { Profession } from './profession.type';

@Injectable({ providedIn: 'root' })
export class ProfessionController {
  service = inject(ProfessionService);

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
