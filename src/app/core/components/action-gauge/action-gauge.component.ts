import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    input,
    signal,
} from '@angular/core';

@Component({
    selector: 'app-action-gauge',
    imports: [CommonModule],
    templateUrl: './action-gauge.component.html',
    styleUrl: './action-gauge.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionGaugeComponent {
    durationMs = input.required<number>(); // durée totale du cycle (ms)
    initValue = input.required<number>(); // temps restant (ms)
    isGreen = input(false);

    private readonly tickMs = 10;
    private intervalId: ReturnType<typeof setInterval> | null = null;

    // temps restant en ms
    private remainingMs = signal(0);

    // hauteur de la barre : 100% quand remaining = duration, 0% quand remaining = 0
    barHeight = computed(() => {
        const duration = Math.max(1, this.durationMs());
        const filled = this.remainingMs() / duration;
        return Math.max(0, Math.min(100, filled * 100));
    });

    _runner = effect((onCleanup) => {
        const duration = Math.max(1, this.durationMs());
        const startRemaining = Math.max(
            0,
            Math.min(this.initValue(), duration)
        );

        // initialise la jauge
        this.remainingMs.set(startRemaining);

        // stoppe tout intervalle précédent
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // ✅ si plus de temps restant → jauge pleine
        if (startRemaining <= 0) {
            this.remainingMs.set(duration);
            return;
        }

        // tick d’animation
        this.intervalId = setInterval(() => {
            this.remainingMs.update((v) => {
                const next = v - this.tickMs;
                if (next <= 0) {
                    // ✅ terminé : jauge pleine
                    this.remainingMs.set(duration);
                    if (this.intervalId) {
                        clearInterval(this.intervalId);
                        this.intervalId = null;
                    }
                    return duration;
                }
                return next;
            });
        }, this.tickMs);

        // cleanup
        onCleanup(() => {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        });
    });
}
