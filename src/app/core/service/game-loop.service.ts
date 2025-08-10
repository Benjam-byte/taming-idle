import { inject, Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameLoopService {
  private running = false;
  zone = inject(NgZone);
  private readonly tickSubject = new BehaviorSubject<number>(Date.now());

  tick$: Observable<number> = this.tickSubject.asObservable();

  constructor() {}

  start() {
    if (this.running) return;
    this.running = true;

    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(this.tick);
    });
  }

  private readonly tick = () => {
    if (!this.running) return;

    const now = Date.now();
    this.tickSubject.next(now);

    requestAnimationFrame(this.tick);
  };
}
