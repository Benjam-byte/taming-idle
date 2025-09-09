import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { God } from './god.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'gods';

@Injectable({ providedIn: 'root' })
export class GodService {
  db = inject(DatabaseService);

  /** Liste complète */
  list(): Observable<God[]> {
    return this.readAll$();
  }

  /** Récupération par id */
  getById(id: string): Observable<God | undefined> {
    return this.readAll$().pipe(map((list) => list.find((p) => p.id === id)));
  }

  /** Recherche par nom (insensible à la casse) */
  findByName(name: string): Observable<God | undefined> {
    const n = name.trim().toLowerCase();
    return this.readAll$().pipe(
      map((list) => list.find((p) => p.name.trim().toLowerCase() === n))
    );
  }

  /** Création (génère un id si manquant) */
  create(data: Omit<God, 'id'> & Partial<Pick<God, 'id'>>): Observable<God> {
    const record: God = {
      id: data.id ?? this.newId(),
      ...data,
    } as God;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  /** Remplacement complet */
  replace(id: string, data: Omit<God, 'id'>): Observable<God> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1) return throwError(() => new Error('God introuvable'));
        const next: God = { id, ...data };
        const updated = [...list];
        updated[idx] = next;
        return this.writeAll$(updated).pipe(map(() => next));
      })
    );
  }

  update(id: string, patch: Partial<Omit<God, 'id'>>): Observable<God[]> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1) return throwError(() => new Error('God introuvable'));
        const merged: God = { ...list[idx], ...patch, id };
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

  private readAll$(): Observable<God[]> {
    return this.db
      .get<God[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: God[]): Observable<void> {
    return this.db.set<God[]>(COLLECTION_KEY, list);
  }

  private newId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return (
      'id_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    );
  }
}
