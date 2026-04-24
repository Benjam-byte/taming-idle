import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, of, forkJoin, defer } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { Platform } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  ready$: Observable<void>;

  constructor(
    private readonly storage: Storage,
    private readonly platform: Platform
  ) {
    this.ready$ = defer(() => from(this.init())).pipe(
      map(() => void 0),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  async init() {
    await this.platform.ready();
    await this.storage.create();
  }

  set<T = unknown>(key: string, value: T): Observable<void> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.set(key, value))),
      map(() => void 0)
    );
  }

  get<T = unknown>(key: string, defaultValue?: T): Observable<T | undefined> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.get(key))),
      map((v) =>
        v === null || typeof v === 'undefined' ? defaultValue : (v as T)
      )
    );
  }

  has(key: string): Observable<boolean> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.get(key))),
      map((v) => !(v === null || typeof v === 'undefined'))
    );
  }

  remove(key: string): Observable<void> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.remove(key))),
      map(() => void 0)
    );
  }

  clear(): Observable<void> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.clear())),
      map(() => void 0)
    );
  }

  keys(): Observable<string[]> {
    return this.ready$.pipe(switchMap(() => from(this.storage.keys())));
  }

  getAll<T = unknown>(): Observable<Record<string, T>> {
    return this.keys().pipe(
      switchMap((keys) => {
        if (!keys.length) return of({} as Record<string, T>);
        return forkJoin(
          keys.map((k) =>
            from(this.storage.get(k)).pipe(map((v) => [k, v as T] as const))
          )
        ).pipe(
          map((entries) => Object.fromEntries(entries) as Record<string, T>)
        );
      })
    );
  }

  merge<T extends Record<string, any>>(
    key: string,
    patch: Partial<T>
  ): Observable<T> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.get(key))),
      map((current) => ({ ...(current ?? {}), ...patch } as T)),
      switchMap((merged) =>
        from(this.storage.set(key, merged)).pipe(map(() => merged))
      )
    );
  }

  incr(key: string, step = 1): Observable<number> {
    return this.ready$.pipe(
      switchMap(() => from(this.storage.get(key))),
      map((v) => (Number(v) || 0) + step),
      switchMap((next) =>
        from(this.storage.set(key, next)).pipe(map(() => next))
      )
    );
  }
}
