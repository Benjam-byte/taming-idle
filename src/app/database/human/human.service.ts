import {
  map,
  Observable,
  of,
  pipe,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { Human } from './human.type';
import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '../database.service';

const COLLECTION_KEY = 'human';

@Injectable({ providedIn: 'root' })
export class HumanService {
  db = inject(DatabaseService);

  get(): Observable<Human> {
    return this.readAll$().pipe(
      take(1),
      map((humanList) => humanList[0])
    );
  }

  /** Création (génère un id si manquant) */
  create(
    data: Omit<Human, 'id'> & Partial<Pick<Human, 'id'>>
  ): Observable<Human> {
    const record: Human = {
      id: data.id ?? this.newId(),
      ...data,
    } as Human;
    return this.readAll$().pipe(
      switchMap((list) =>
        this.writeAll$([record, ...list]).pipe(map(() => record))
      )
    );
  }

  update(id: string, patch: Partial<Omit<Human, 'id'>>): Observable<Human> {
    return this.readAll$().pipe(
      switchMap((list) => {
        const idx = list.findIndex((h) => h.id === id);
        if (idx === -1) return throwError(() => new Error('Human introuvable'));
        const merged: Human = { ...list[idx], ...patch, id };
        const updated = [...list];
        updated[idx] = merged;
        return this.writeAll$(updated).pipe(map(() => merged));
      })
    );
  }

  private readAll$(): Observable<Human[]> {
    return this.db
      .get<Human[]>(COLLECTION_KEY, [])
      .pipe(map((v) => (Array.isArray(v) ? v : [])));
  }

  private writeAll$(list: Human[]): Observable<void> {
    return this.db.set<Human[]>(COLLECTION_KEY, list);
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
