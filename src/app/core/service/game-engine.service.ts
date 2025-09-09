import { inject, Injectable } from '@angular/core';
import { GameLoopService } from './game-loop.service';
import { GameEvent } from '../models/gameEvent.type';
import {
  combineLatest,
  distinctUntilChanged,
  first,
  map,
  Observable,
} from 'rxjs';
import { MapService } from './location/map.service';
import { WorldService } from './location/world.service';
import { ProfessionManagerService } from './player/profession-manager.service';
import { HumanManagerService } from './player/human-manager.service';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  mapService = inject(MapService);
  worldService = inject(WorldService);
  professionManager = inject(ProfessionManagerService);
  gameLoopService = inject(GameLoopService);
  humanManagerService = inject(HumanManagerService);

  constructor() {
    this.gameLoopService.start();
  }

  getNextTick$() {
    return this.gameLoopService.tick$.pipe(first());
  }

  getTick$() {
    return this.gameLoopService.tick$;
  }

  submitEventByType(type: string, payload?: any) {
    this.gameLoopService.tick$
      .pipe(first())
      .subscribe((now) => this.processEvent({ type, time: now, payload }, now));
  }

  getTravelCountDown$(): Observable<number> {
    return combineLatest([this.gameLoopService.tick$]).pipe(
      map(([now]) =>
        Math.max(0, this.humanManagerService.nextTravelTime - now)
      ),
      distinctUntilChanged()
    );
  }

  getFightingCountDown$(): Observable<number> {
    return combineLatest([this.gameLoopService.tick$]).pipe(
      map(([now]) => Math.max(0, this.humanManagerService.nextFightTime - now)),
      distinctUntilChanged()
    );
  }

  getSearchingCountDown$(): Observable<number> {
    return combineLatest([this.gameLoopService.tick$]).pipe(
      map(([now]) =>
        Math.max(0, this.humanManagerService.nextSearchTime - now)
      ),
      distinctUntilChanged()
    );
  }

  private processEvent(event: GameEvent, now: number) {
    switch (event.type) {
      case 'travel':
        if (this.humanManagerService.advance(now)) {
          this.professionManager.updateByProfessionName('Voyageur');
          this.mapService.changeMap();
        }
        break;
      case 'fight':
        if (this.humanManagerService.fight(now)) event.payload();
        break;
      case 'flee':
        this.mapService.changeMap();
        break;
      case 'kill':
        this.professionManager.updateByProfessionName('Guerrier');
        break;
      case 'skip':
        this.mapService.changeMap();
        break;
    }
  }
}
