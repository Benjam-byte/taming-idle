import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { Region } from './region.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'regions';

@Injectable({ providedIn: 'root' })
export class RegionService {
  db = inject(DatabaseService);

  /** Liste complète */
  list(): Observable<Region[]> {
    return this.readAll$();
  }

  /** Récupération par id */
  getById(id: string): Observable<Region | undefined> {
    return this.readAll$().pipe(map((list) => list.find((p) => p.id === id)));
  }

  /** Recherche par nom (insensible à la casse) */
  findByName(name: string): Observable<Region | undefined> {
    const n = name.trim().toLowerCase();
    return this.readAll$().pipe(
      map((list) => list.find((p) => p.name.trim().toLowerCase() === n))
    );
  }

  /** Création (génère un id si manquant) */
  create(
    data: Omit<Region, 'id'> & Partial<Pick<Region, 'id'>>
  ): Observable<Region> {
    const record: Region = {
      id: data.id ?? this.newId(),
      ...data,
    } as Region;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  /** Remplacement complet */
  replace(id: string, data: Omit<Region, 'id'>): Observable<Region> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1)
          return throwError(() => new Error('Region introuvable'));
        const next: Region = { id, ...data };
        const updated = [...list];
        updated[idx] = next;
        return this.writeAll$(updated).pipe(map(() => next));
      })
    );
  }

  update(id: string, patch: Partial<Omit<Region, 'id'>>): Observable<Region> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1)
          return throwError(() => new Error('Region introuvable'));
        const merged: Region = { ...list[idx], ...patch, id };
        const updated = [...list];
        updated[idx] = merged;
        return this.writeAll$(updated).pipe(map(() => merged));
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

  private readAll$(): Observable<Region[]> {
    return this.db
      .get<Region[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: Region[]): Observable<void> {
    return this.db.set<Region[]>(COLLECTION_KEY, list);
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
