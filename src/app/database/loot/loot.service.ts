import { map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { Loot } from './loot.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'loot';

@Injectable({ providedIn: 'root' })
export class LootService {
  db = inject(DatabaseService);

  /** Liste complète */
  get(): Observable<Loot> {
    return this.readAll$().pipe(
      take(1),
      map((lootList) => lootList[0])
    );
  }

  /** Création (génère un id si manquant) */
  create(data: Omit<Loot, 'id'> & Partial<Pick<Loot, 'id'>>): Observable<Loot> {
    const record: Loot = {
      id: data.id ?? this.newId(),
      ...data,
    } as Loot;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  update(id: string, patch: Partial<Omit<Loot, 'id'>>): Observable<Loot> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((h) => h.id === id);
        if (idx === -1) return throwError(() => new Error('Loot introuvable'));
        const merged: Loot = { ...list[idx], ...patch, id };
        const updated = [...list];
        updated[idx] = merged;
        return this.writeAll$(updated).pipe(map(() => merged));
      })
    );
  }

  private readAll$(): Observable<Loot[]> {
    return this.db
      .get<Loot[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: Loot[]): Observable<void> {
    return this.db.set<Loot[]>(COLLECTION_KEY, list);
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
