import { inject, Injectable } from '@angular/core';
import { concatMap, from, Observable } from 'rxjs';
import { RelicsService } from './reclis.service';
import { Relics } from './relics.type';
import { relicList } from '../../core/config/relics';

@Injectable({ providedIn: 'root' })
export class RelicsController {
    service = inject(RelicsService);

    init() {
        return from(relicList).pipe(concatMap((relics) => this.create(relics)));
    }

    create(relic: Omit<Relics, 'id'>): Observable<Relics> {
        return this.service.create(relic);
    }

    get(relicName: string): Observable<Relics | undefined> {
        return this.service.findByName(relicName);
    }

    getAll(): Observable<Relics[]> {
        return this.service.list();
    }

    updateOne(
        id: string,
        relics: Partial<Omit<Relics, 'id'>>
    ): Observable<Relics[]> {
        return this.service.update(id, relics);
    }

    delete(id: string): Observable<boolean> {
        return this.service.remove(id);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
