import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EggService } from './egg.service';
import { Egg } from './egg.type';

const defaultEgg = {
    image: './assets/egg/slime_egg.png',
    monsterName: 'Slime',
    createdAt: new Date(),
    hatchingTime: 0, // 1 hour
    incubateur: null,
};

@Injectable({ providedIn: 'root' })
export class EggController {
    service = inject(EggService);

    init() {
        return of(void 0);
    }

    create(egg: Omit<Egg, 'id'>): Observable<Egg[]> {
        return this.service.create(egg);
    }

    get(id: string): Observable<Egg | undefined> {
        return this.service.getById(id);
    }

    getAll(): Observable<Egg[]> {
        return this.service.list();
    }

    updateOne(id: string, egg: Partial<Omit<Egg, 'id'>>): Observable<Egg[]> {
        return this.service.update(id, egg);
    }

    delete(id: string): Observable<Egg[]> {
        return this.service.remove(id);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
