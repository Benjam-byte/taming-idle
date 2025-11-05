import { map, Observable, switchMap, take, throwError } from 'rxjs';
import { OfflineValueProgress } from './offline-progress.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'offlineProgress';

@Injectable({ providedIn: 'root' })
export class OfflineProgressService {
    db = inject(DatabaseService);

    /** Liste complète */
    get(): Observable<OfflineValueProgress> {
        return this.readAll$().pipe(
            take(1),
            map((offlineProgressList) => offlineProgressList[0])
        );
    }

    /** Création (génère un id si manquant) */
    create(
        data: Omit<OfflineValueProgress, 'id'> &
            Partial<Pick<OfflineValueProgress, 'id'>>
    ): Observable<OfflineValueProgress> {
        const record: OfflineValueProgress = {
            id: data.id ?? this.newId(),
            ...data,
        } as OfflineValueProgress;
        return this.readAll$().pipe(
            switchMap((list) =>
                this.writeAll$([record, ...list]).pipe(map(() => record))
            )
        );
    }

    update(
        id: string,
        patch: Partial<Omit<OfflineValueProgress, 'id'>>
    ): Observable<OfflineValueProgress> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const idx = list.findIndex((h) => h.id === id);
                if (idx === -1)
                    return throwError(
                        () => new Error('OfflineProgress introuvable')
                    );
                const merged: OfflineValueProgress = {
                    ...list[idx],
                    ...patch,
                    id,
                };
                const updated = [...list];
                updated[idx] = merged;
                return this.writeAll$(updated).pipe(map(() => merged));
            })
        );
    }

    dropTable(): Observable<void> {
        return this.db.remove(COLLECTION_KEY);
    }

    private readAll$(): Observable<OfflineValueProgress[]> {
        return this.db
            .get<OfflineValueProgress[]>(COLLECTION_KEY, [])
            .pipe(map((v) => (Array.isArray(v) ? v : [])));
    }

    private writeAll$(list: OfflineValueProgress[]): Observable<void> {
        return this.db.set<OfflineValueProgress[]>(COLLECTION_KEY, list);
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
