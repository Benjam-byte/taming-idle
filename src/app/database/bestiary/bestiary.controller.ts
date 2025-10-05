import { inject, Injectable } from '@angular/core';
import { concatMap, from, Observable } from 'rxjs';
import { BestiaryService } from './bestiary.service';
import { MonsterProfile } from './bestiary.type';
import { bestiaryList } from '../../core/json/bestiary';

@Injectable({ providedIn: 'root' })
export class BestiaryController {
    service = inject(BestiaryService);

    init() {
        return from(bestiaryList).pipe(
            concatMap((bestiary) => this.create(bestiary))
        );
    }

    create(monster: Omit<MonsterProfile, 'id'>): Observable<MonsterProfile> {
        return this.service.create(monster);
    }

    get(monsterName: string): Observable<MonsterProfile | undefined> {
        return this.service.findByName(monsterName);
    }

    getAll(): Observable<MonsterProfile[]> {
        return this.service.list();
    }

    updateOne(
        id: string,
        bestiary: Partial<Omit<MonsterProfile, 'id'>>
    ): Observable<MonsterProfile[]> {
        return this.service.update(id, bestiary);
    }

    delete(id: string): Observable<boolean> {
        return this.service.remove(id);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
