import { CommonModule } from '@angular/common';
import { Component, computed, effect, input, signal } from '@angular/core';

@Component({
    selector: 'app-action-gauge',
    imports: [CommonModule],
    templateUrl: './action-gauge.component.html',
    styleUrl: './action-gauge.component.scss',
})
export class ActionGaugeComponent {
    durationMs = input<number>(1000);
    initValue = input<number>(0);
    isGreen = input<boolean>(false);

    valuebar = signal(0);
    intervalId!: any | null;

    progressUpdate = effect(() => {
        if (this.initValue() === 950) {
            if (!this.intervalId) {
                this.intervalId = setInterval(() => {
                    this.valuebar.update((v) => v + this.durationMs() / 100);
                    if (this.valuebar() >= this.durationMs()) {
                        if (!this.intervalId) return;
                        clearInterval(this.intervalId);
                        this.valuebar.set(0);
                        this.intervalId = null;
                    }
                }, 10);
            }
        }
    });

    barStyle = computed(() => {
        return {
            height: `${this.normalizeToPercent(
                this.valuebar(),
                this.durationMs()
            )}%`,
        };
    });

    private normalizeToPercent(x: number, durationInMs: number): number {
        const filled = 1 - x / durationInMs;
        return Math.max(0, Math.min(100, filled * 100));
    }
}
