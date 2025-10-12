import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { Egg } from './egg.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'eggs';

@Injectable({ providedIn: 'root' })
export class EggService {
    db = inject(DatabaseService);

    /** Liste complète */
    list(): Observable<Egg[]> {
        return this.readAll$();
    }

    /** Récupération par id */
    getById(id: string): Observable<Egg | undefined> {
        return this.readAll$().pipe(
            map((list) => list.find((p) => p.id === id))
        );
    }

    /** Création (génère un id si manquant) */
    create(data: Omit<Egg, 'id'> & Partial<Pick<Egg, 'id'>>): Observable<Egg> {
        const record: Egg = {
            id: data.id ?? this.newId(),
            ...data,
        } as Egg;
        return this.readAll$().pipe(
            switchMap((list) =>
                this.writeAll$([record, ...list]).pipe(map(() => record))
            )
        );
    }

    /** Remplacement complet */
    replace(id: string, data: Omit<Egg, 'id'>): Observable<Egg> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const idx = list.findIndex((p) => p.id === id);
                if (idx === -1)
                    return throwError(() => new Error('Egg introuvable'));
                const next: Egg = { id, ...data };
                const updated = [...list];
                updated[idx] = next;
                return this.writeAll$(updated).pipe(map(() => next));
            })
        );
    }

    update(id: string, patch: Partial<Omit<Egg, 'id'>>): Observable<Egg[]> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const idx = list.findIndex((p) => p.id === id);
                if (idx === -1)
                    return throwError(() => new Error('Egg introuvable'));
                const merged: Egg = { ...list[idx], ...patch, id };
                const updated = [...list];
                updated[idx] = merged;
                return this.writeAll$(updated).pipe(map(() => updated));
            })
        );
    }

    remove(id: string): Observable<boolean> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const updated = list.filter((p) => p.id !== id);
                const changed = updated.length !== list.length;
                if (!changed) return of(false);
                return this.writeAll$(updated).pipe(map(() => true));
            })
        );
    }

    dropTable(): Observable<void> {
        return this.db.remove(COLLECTION_KEY);
    }

    private readAll$(): Observable<Egg[]> {
        return this.db
            .get<Egg[]>(COLLECTION_KEY, [])
            .pipe(map((v) => (Array.isArray(v) ? v : [])));
    }

    private writeAll$(list: Egg[]): Observable<void> {
        return this.db.set<Egg[]>(COLLECTION_KEY, list);
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
