import { map, Observable, of, switchMap, throwError } from 'rxjs';
import { Profession } from './profession.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'professions';

@Injectable({ providedIn: 'root' })
export class ProfessionService {
  db = inject(DatabaseService);

  /** Liste complète */
  list(): Observable<Profession[]> {
    return this.readAll$();
  }

  /** Récupération par id */
  getById(id: string): Observable<Profession | undefined> {
    return this.readAll$().pipe(map((list) => list.find((p) => p.id === id)));
  }

  /** Recherche par nom (insensible à la casse) */
  findByName(name: string): Observable<Profession | undefined> {
    const n = name.trim().toLowerCase();
    return this.readAll$().pipe(
      map((list) => list.find((p) => p.name.trim().toLowerCase() === n))
    );
  }

  /** Création (génère un id si manquant) */
  create(
    data: Omit<Profession, 'id'> & Partial<Pick<Profession, 'id'>>
  ): Observable<Profession> {
    const record: Profession = {
      id: data.id ?? this.newId(),
      ...data,
    } as Profession;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  /** Remplacement complet */
  replace(id: string, data: Omit<Profession, 'id'>): Observable<Profession> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1)
          return throwError(() => new Error('Profession introuvable'));
        const next: Profession = { id, ...data };
        const updated = [...list];
        updated[idx] = next;
        return this.writeAll$(updated).pipe(map(() => next));
      })
    );
  }

  update(
    id: string,
    patch: Partial<Omit<Profession, 'id'>>
  ): Observable<Profession[]> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((p) => p.id === id);
        if (idx === -1)
          return throwError(() => new Error('Profession introuvable'));
        const merged: Profession = { ...list[idx], ...patch, id };
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

  clearAll(): Observable<void> {
    return this.writeAll$([]);
  }

  private readAll$(): Observable<Profession[]> {
    return this.db
      .get<Profession[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: Profession[]): Observable<void> {
    return this.db.set<Profession[]>(COLLECTION_KEY, list);
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
