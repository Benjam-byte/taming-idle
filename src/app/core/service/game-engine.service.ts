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
import { MapManagerService } from './location/map.service';
import { WorldManagerService } from './location/world.service';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';
import { FlashOverlayService } from './Ui/flash-overlay';

@Injectable({
    providedIn: 'root',
})
export class GameEngineService {
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    mapService = inject(MapManagerService);
    worldService = inject(WorldManagerService);
    gameLoopService = inject(GameLoopService);
    flashOverlay = inject(FlashOverlayService);

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
            .subscribe((now) =>
                this.processEvent({ type, time: now, payload }, now)
            );
    }

    getTravelCountDown$(): Observable<number> {
        return combineLatest([this.gameLoopService.tick$]).pipe(
            map(([now]) =>
                Math.max(0, this.assignedMonsterManager.nextTravelTime - now)
            ),
            distinctUntilChanged()
        );
    }

    getFightingCountDown$(): Observable<number> {
        return combineLatest([this.gameLoopService.tick$]).pipe(
            map(([now]) =>
                Math.max(0, this.assignedMonsterManager.nextFightTime - now)
            ),
            distinctUntilChanged()
        );
    }

    private processEvent(event: GameEvent, now: number) {
        switch (event.type) {
            case 'travel':
                if (this.assignedMonsterManager.advance(now)) {
                    this.assignedMonsterManager
                        .xpByProfessionName$('Voyageur')
                        .subscribe();
                    this.flashOverlay.flash({
                        duration: 200,
                        color: 'rgba(0, 0, 0,0.6)',
                        peakOpacity: 0.4,
                    });
                    setTimeout(
                        () =>
                            this.mapService.travelWhere(
                                event.payload.direction
                            ),
                        200
                    );
                }
                break;
            case 'fight':
                if (this.assignedMonsterManager.fight(now)) event.payload();
                break;
            case 'flee':
                this.flashOverlay.flash({
                    duration: 400,
                    color: 'rgba(255, 0, 0, 1)',
                    peakOpacity: 0.4,
                });

                setTimeout(() => this.mapService.travelRandom(), 400);
                break;
            case 'skip':
                this.flashOverlay.flash({
                    duration: 400,
                    color: 'rgba(255, 174, 0,1)',
                    peakOpacity: 0.4,
                });

                setTimeout(() => this.mapService.travelRandom(), 400);
                break;
        }
    }
}
