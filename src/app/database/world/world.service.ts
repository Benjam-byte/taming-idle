import { map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { World } from './world.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'world';

@Injectable({ providedIn: 'root' })
export class WorldService {
  db = inject(DatabaseService);

  /** Liste complète */
  get(): Observable<World> {
    return this.readAll$().pipe(
      take(1),
      map((worldList) => worldList[0])
    );
  }

  /** Création (génère un id si manquant) */
  create(
    data: Omit<World, 'id'> & Partial<Pick<World, 'id'>>
  ): Observable<World> {
    const record: World = {
      id: data.id ?? this.newId(),
      ...data,
    } as World;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  update(id: string, patch: Partial<Omit<World, 'id'>>): Observable<World> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((h) => h.id === id);
        if (idx === -1) return throwError(() => new Error('World introuvable'));
        const merged: World = { ...list[idx], ...patch, id };
        const updated = [...list];
        updated[idx] = merged;
        return this.writeAll$(updated).pipe(map(() => merged));
      })
    );
  }

  private readAll$(): Observable<World[]> {
    return this.db
      .get<World[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: World[]): Observable<void> {
    return this.db.set<World[]>(COLLECTION_KEY, list);
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
