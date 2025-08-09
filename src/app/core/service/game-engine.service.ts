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
import { CombatTower } from '../value-object/combat-tower';
import God from '../value-object/god';
import godJson from '../value-object/godJson.json';
import { MapService } from './location/map.service';
import { WorldService } from './location/world.service';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  mapService = inject(MapService);
  worldService = inject(WorldService);
  gameLoop = inject(GameLoopService);

  human = signal<Human>(new Human(1));
  godList = signal<God[]>(this.parseGodsFromJson(godJson));
  combatTower = signal<CombatTower>(new CombatTower());

  constructor() {
    this.gameLoop.start();
  }

  getNextTick$() {
    return this.gameLoop.tick$.pipe(first());
  }

  getTick$() {
    return this.gameLoop.tick$;
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
        if (this.human().advance(now)) this.mapService.changeMap();
        break;
      case 'fight':
        if (this.human().fight(now)) event.payload();
        break;
      case 'flee':
        this.mapService.changeMap();
        break;
      case 'kill':
        this.human().advance(now);
        this.mapService.changeMap();
        break;
      case 'skip':
        this.mapService.changeMap();
        break;
    }
  }

  private parseGodsFromJson(json: God[]): God[] {
    return json.map(
      (god) =>
        new God(god.name, god.description, god.imagePath, god.offeringList)
    );
  }
}
