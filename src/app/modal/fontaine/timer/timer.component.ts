import { Component, computed, effect, input, signal } from '@angular/core';
import { timeUntilAvailable } from 'src/app/core/helpers/time-format';

@Component({
    selector: 'app-timer',
    templateUrl: './timer.component.html',
    styleUrls: ['./timer.component.scss'],
    imports: [],
})
export class TimerComponent {
    endTime = input.required<number>();

    now = signal(Date.now());

    tick = effect((onCleanup) => {
        const id = setInterval(() => this.now.set(Date.now()), 1000);
        onCleanup(() => clearInterval(id));
    });

    remainingMs = computed(() =>
        timeUntilAvailable(Math.max(0, this.endTime() - this.now()))
    );
}
