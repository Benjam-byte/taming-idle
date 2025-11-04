import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';
import { TamedMonster } from './tamed-monster.type';

const COLLECTION_KEY = 'tamedMonsters';

@Injectable({ providedIn: 'root' })
export class TamedMonsterService {
    db = inject(DatabaseService);

    /** Liste complète */
    list(): Observable<TamedMonster[]> {
        return this.readAll$();
    }

    /** Récupération par id */
    getById(id: string): Observable<TamedMonster | undefined> {
        return this.readAll$().pipe(
            map((list) => list.find((p) => p.id === id))
        );
    }

    /** Recherche par nom (insensible à la casse) */
    findByName(name: string): Observable<TamedMonster | undefined> {
        const n = name.trim().toLowerCase();
        return this.readAll$().pipe(
            map((list) => list.find((p) => p.name.trim().toLowerCase() === n))
        );
    }

    /** Création (génère un id si manquant) */
    create(
        data: Omit<TamedMonster, 'id'> & Partial<Pick<TamedMonster, 'id'>>
    ): Observable<TamedMonster[]> {
        const record: TamedMonster = {
            id: data.id ?? this.newId(),
            ...data,
        } as TamedMonster;
        return this.readAll$().pipe(
            switchMap((list) =>
                this.writeAll$([record, ...list]).pipe(
                    map(() => [record, ...list])
                )
            )
        );
    }

    /** Remplacement complet */
    replace(
        id: string,
        data: Omit<TamedMonster, 'id'>
    ): Observable<TamedMonster> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const idx = list.findIndex((p) => p.id === id);
                if (idx === -1)
                    return throwError(
                        () => new Error('TamedMonster introuvable')
                    );
                const next: TamedMonster = { id, ...data };
                const updated = [...list];
                updated[idx] = next;
                return this.writeAll$(updated).pipe(map(() => next));
            })
        );
    }

    update(
        id: string,
        patch: Partial<Omit<TamedMonster, 'id'>>
    ): Observable<TamedMonster[]> {
        return this.readAll$().pipe(
            switchMap((list) => {
                const idx = list.findIndex((p) => p.id === id);
                if (idx === -1)
                    return throwError(
                        () => new Error('TamedMonster introuvable')
                    );
                const merged: TamedMonster = { ...list[idx], ...patch, id };
                const updated = [...list];
                updated[idx] = merged;
                return this.writeAll$(updated).pipe(map(() => updated));
            })
        );
    }

    updateAll(tamedMonsterList: TamedMonster[]): Observable<TamedMonster[]> {
        return this.writeAll$(tamedMonsterList).pipe(
            map(() => tamedMonsterList)
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

    private readAll$(): Observable<TamedMonster[]> {
        return this.db
            .get<TamedMonster[]>(COLLECTION_KEY, [])
            .pipe(map((v) => (Array.isArray(v) ? v : [])));
    }

    private writeAll$(list: TamedMonster[]): Observable<void> {
        return this.db.set<TamedMonster[]>(COLLECTION_KEY, list);
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
