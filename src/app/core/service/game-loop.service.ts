import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimersService } from './timer.service';

const UPDATE_TIME = 50;

@Injectable({ providedIn: 'root' })
export class GameLoopService {
    timerService = inject(TimersService);
    private intervalId: number | null = null;
    zone = inject(NgZone);
    private readonly tickSubject = new BehaviorSubject<number>(Date.now());

    tick$: Observable<number> = this.tickSubject.asObservable();

    constructor() {}

    start() {
        if (this.intervalId !== null) return;

        this.zone.runOutsideAngular(() => {
            this.intervalId = this.timerService.setInterval(() => {
                this.tickSubject.next(this.tickSubject.value + UPDATE_TIME);
            }, UPDATE_TIME);
        });
    }

    stop(): void {
        if (this.intervalId === null) return;
        this.timerService.clearInterval(this.intervalId);
        this.intervalId = null;
    }
}
