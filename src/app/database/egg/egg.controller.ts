import { inject, Injectable } from '@angular/core';
import { concatMap, from, Observable, of } from 'rxjs';
import { EggService } from './egg.service';
import { Egg } from './egg.type';

const defaultEgg = {
    image: './assets/egg/slime_egg.png',
    monsterName: 'Slime',
    createdAt: new Date(),
    hatchingTime: 1000 * 60 * 60 * 1, // 1 hour
};

@Injectable({ providedIn: 'root' })
export class EggController {
    service = inject(EggService);

    init() {
        return from([defaultEgg]).pipe(concatMap((egg) => this.create(egg)));
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

    delete(id: string): Observable<boolean> {
        return this.service.remove(id);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
