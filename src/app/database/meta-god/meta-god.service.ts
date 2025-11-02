import { map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { MetaGodOption } from './meta-god.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'MetaGod';

@Injectable({ providedIn: 'root' })
export class MetaGodService {
    db = inject(DatabaseService);

    /** Liste complète */
    get(): Observable<MetaGodOption[]> {
        return this.readAll$().pipe(
            take(1),
            map((MetaGodList) => MetaGodList)
        );
    }

    /** Création (génère un id si manquant) */
    create(
        data: Omit<MetaGodOption, 'id'> & Partial<Pick<MetaGodOption, 'id'>>
    ): Observable<MetaGodOption[]> {
        const record: MetaGodOption = {
            id: data.id ?? this.newId(),
            ...data,
        } as MetaGodOption;
        return this.readAll$().pipe(
            switchMap((list) =>
                this.writeAll$([record, ...list]).pipe(
                    map(() => [record, ...list])
                )
            )
        );
    }

    update(
        id: string,
        patch: Partial<Omit<MetaGodOption, 'id'>>
    ): Observable<MetaGodOption[]> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const idx = list.findIndex((h) => h.id === id);
                if (idx === -1)
                    return throwError(() => new Error('MetaGod introuvable'));
                const merged: MetaGodOption = { ...list[idx], ...patch, id };
                const updated = [...list];
                updated[idx] = merged;
                return this.writeAll$(updated).pipe(map(() => updated));
            })
        );
    }

    dropTable(): Observable<void> {
        return this.db.remove(COLLECTION_KEY);
    }

    private readAll$(): Observable<MetaGodOption[]> {
        return this.db
            .get<MetaGodOption[]>(COLLECTION_KEY, [])
            .pipe(map((v) => (Array.isArray(v) ? v : [])));
    }

    private writeAll$(list: MetaGodOption[]): Observable<void> {
        return this.db.set<MetaGodOption[]>(COLLECTION_KEY, list);
    }

    private newId(): string {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }
        return (
            'id_' +
            Math.random().toString(36).slice(2) +
            Date.now().toString(36)
        );
    }
}
