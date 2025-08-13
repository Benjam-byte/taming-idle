import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HumanService } from './human.service';
import { Human } from './human.type';

@Injectable({ providedIn: 'root' })
export class HumanController {
  service = inject(HumanService);

  create(human: Omit<Human, 'id'>): Observable<Human> {
    return this.service.create(human);
  }

  get(): Observable<Human | undefined> {
    return this.service.get();
  }

  update(id: string, human: Human): Observable<Human> {
    return this.service.update(id, human);
  }
}
