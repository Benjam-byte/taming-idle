import { Component, computed, effect, input, signal } from '@angular/core';
import { Egg } from 'src/app/database/egg/egg.type';
import { FormatDuration } from '../../../core/pipe/formatDuration.pipe';

@Component({
    selector: 'app-egg-timer',
    templateUrl: './egg-timer.component.html',
    styleUrls: ['./egg-timer.component.scss'],
    imports: [FormatDuration],
})
export class EggTimerComponent {
    egg = input.required<Egg>();

    now = signal(Date.now());

    tick = effect((onCleanup) => {
        const id = setInterval(() => this.now.set(Date.now()), 1000);
        onCleanup(() => clearInterval(id));
    });

    startTs = computed(() => {
        const egg = this.egg();
        return egg.incubateur?.startedAt ?? egg.createdAt.getTime();
    });

    endTs = computed(() => this.startTs() + this.egg().hatchingTime);

    remainingMs = computed(() => Math.max(0, this.endTs() - this.now()));
}
