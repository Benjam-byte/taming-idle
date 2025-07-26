import { inject, Injectable, signal } from '@angular/core';
import Human from '../value-object/human';
import { GameLoopService } from './game-loop.service';
import { GameEvent } from '../models/gameEvent.type';
import {
  combineLatest,
  distinctUntilChanged,
  first,
  map,
  Observable,
} from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

type MapKey = 'tresor' | 'monster' | 'empty';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  currentMap = signal<string | undefined>('empty');
  human = signal<Human>(new Human(1));
  gameLoop = inject(GameLoopService);

  mapDict: Record<MapKey, number> = {
    tresor: 1 / 10,
    monster: 1 / 10,
    empty: 8 / 10,
  };

  constructor() {
    this.gameLoop.start();
  }

  getNextTick$() {
    return this.gameLoop.tick$.pipe(first());
  }

  submitEventByType(type: string, payload?: any) {
    this.gameLoop.tick$
      .pipe(first())
      .subscribe((now) => this.processEvent({ type, time: now, payload }, now));
  }

  getTravelCountDown$(): Observable<number> {
    return combineLatest([this.gameLoop.tick$, toObservable(this.human)]).pipe(
      map(([now, human]) => Math.max(0, human.nextTravelTime - now)),
      distinctUntilChanged()
    );
  }

  getFightingCountDown$(): Observable<number> {
    return combineLatest([this.gameLoop.tick$, toObservable(this.human)]).pipe(
      map(([now, human]) => Math.max(0, human.nextFightTime - now)),
      distinctUntilChanged()
    );
  }

  getSearchingCountDown$(): Observable<number> {
    return combineLatest([this.gameLoop.tick$, toObservable(this.human)]).pipe(
      map(([now, human]) => Math.max(0, human.nextSearchTime - now)),
      distinctUntilChanged()
    );
  }

  private processEvent(event: GameEvent, now: number) {
    switch (event.type) {
      case 'travel':
        if (this.human().advance(now)) this.changeMap();
        break;
      case 'fight':
        if (this.human().fight(now)) event.payload();
        break;
      case 'kill':
        this.changeMap();
        break;
    }
  }

  private getRandomMap(): MapKey {
    const rand = Math.random();
    let cumulative = 0;

    for (const [key, prob] of Object.entries(this.mapDict)) {
      cumulative += prob;
      if (rand < cumulative) {
        return key as MapKey;
      }
    }

    return 'empty';
  }

  private changeMap() {
    this.currentMap.set(undefined);
    const map = this.getRandomMap();
    setTimeout(() => {
      this.currentMap.set(map);
    }, 100);
  }
}
