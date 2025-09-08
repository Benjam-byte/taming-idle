import { map, Observable, of, switchMap, take, throwError } from 'rxjs';
import { CombatTower } from './combatTower.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'combatTower';

@Injectable({ providedIn: 'root' })
export class CombatTowerService {
  db = inject(DatabaseService);

  /** Liste complète */
  get(): Observable<CombatTower> {
    return this.readAll$().pipe(
      take(1),
      map((combatTowerList) => combatTowerList[0])
    );
  }

  /** Création (génère un id si manquant) */
  create(
    data: Omit<CombatTower, 'id'> & Partial<Pick<CombatTower, 'id'>>
  ): Observable<CombatTower> {
    const record: CombatTower = {
      id: data.id ?? this.newId(),
      ...data,
    } as CombatTower;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  update(
    id: string,
    patch: Partial<Omit<CombatTower, 'id'>>
  ): Observable<CombatTower> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((h) => h.id === id);
        if (idx === -1)
          return throwError(() => new Error('CombatTower introuvable'));
        const merged: CombatTower = { ...list[idx], ...patch, id };
        const updated = [...list];
        updated[idx] = merged;
        return this.writeAll$(updated).pipe(map(() => merged));
      })
    );
  }

  dropTable(): Observable<void> {
    return this.db.remove(COLLECTION_KEY);
  }

  private readAll$(): Observable<CombatTower[]> {
    return this.db
      .get<CombatTower[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: CombatTower[]): Observable<void> {
    return this.db.set<CombatTower[]>(COLLECTION_KEY, list);
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
