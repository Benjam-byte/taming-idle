import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';

@Component({
  selector: 'app-action-gauge',
  imports: [CommonModule],
  templateUrl: './action-gauge.component.html',
  styleUrl: './action-gauge.component.scss',
})
export class ActionGaugeComponent {
  durationMs = input<number>(1000);
  progress = input<number>(0);
  isGreen = input<boolean>(false);

  barStyle = computed(() => {
    return {
      height: `${this.normalizeToPercent(this.progress(), this.durationMs())}%`,
    };
  });

  private normalizeToPercent(x: number, durationInMs: number): number {
    if (durationInMs <= 0) return 100;
    const filled = 1 - x / durationInMs;
    return Math.max(0, Math.min(100, filled * 100));
  }
}
