import { inject, Injectable } from '@angular/core';
import { concatMap, from, Observable } from 'rxjs';
import { TamedMonsterService } from './tamed-monster.service';
import { TamedMonster } from './tamed-monster.type';

@Injectable({ providedIn: 'root' })
export class TamedMonsterController {
    service = inject(TamedMonsterService);

    init() {
        return from([]).pipe(
            concatMap((tamedMonster) => this.create(tamedMonster))
        );
    }

    create(monster: Omit<TamedMonster, 'id'>): Observable<TamedMonster> {
        return this.service.create(monster);
    }

    get(monsterName: string): Observable<TamedMonster | undefined> {
        return this.service.findByName(monsterName);
    }

    getAll(): Observable<TamedMonster[]> {
        return this.service.list();
    }

    updateOne(
        id: string,
        tamedMonster: Partial<Omit<TamedMonster, 'id'>>
    ): Observable<TamedMonster[]> {
        return this.service.update(id, tamedMonster);
    }

    delete(id: string): Observable<boolean> {
        return this.service.remove(id);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
