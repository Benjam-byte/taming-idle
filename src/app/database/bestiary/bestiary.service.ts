import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { MonsterProfile } from './bestiary.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'bestiarys';

@Injectable({ providedIn: 'root' })
export class BestiaryService {
  db = inject(DatabaseService);

  /** Liste complète */
  list(): Observable<MonsterProfile[]> {
    return this.readAll$();
  }

  /** Récupération par id */
  getById(id: string): Observable<MonsterProfile | undefined> {
    return this.readAll$().pipe(map((list) => list.find((p) => p.id === id)));
  }

  /** Recherche par nom (insensible à la casse) */
  findByName(name: string): Observable<MonsterProfile | undefined> {
    const n = name.trim().toLowerCase();
    return this.readAll$().pipe(
      map((list) => list.find((p) => p.name.trim().toLowerCase() === n))
    );
  }

  /** Création (génère un id si manquant) */
  create(
    data: Omit<MonsterProfile, 'id'> & Partial<Pick<MonsterProfile, 'id'>>
  ): Observable<MonsterProfile> {
    const record: MonsterProfile = {
      id: data.id ?? this.newId(),
      ...data,
    } as MonsterProfile;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  /** Remplacement complet */
  replace(
    id: string,
    data: Omit<MonsterProfile, 'id'>
  ): Observable<MonsterProfile> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1)
          return throwError(() => new Error('MonsterProfile introuvable'));
        const next: MonsterProfile = { id, ...data };
        const updated = [...list];
        updated[idx] = next;
        return this.writeAll$(updated).pipe(map(() => next));
      })
    );
  }

  update(
    id: string,
    patch: Partial<Omit<MonsterProfile, 'id'>>
  ): Observable<MonsterProfile[]> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1)
          return throwError(() => new Error('Bestiary introuvable'));
        const merged: MonsterProfile = { ...list[idx], ...patch, id };
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

  private readAll$(): Observable<MonsterProfile[]> {
    return this.db
      .get<MonsterProfile[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: MonsterProfile[]): Observable<void> {
    return this.db.set<MonsterProfile[]>(COLLECTION_KEY, list);
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
