import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type HpBarTone = 'player' | 'enemy';
export type HpBarSize = 'sm' | 'md';

@Component({
  selector: 'app-hp-bar',
  standalone: true,
  templateUrl: './hp-bar.component.html',
  styleUrl: './hp-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HpBarComponent {
  readonly current = input(0);
  readonly max = input(0);
  readonly tone = input<HpBarTone>('player');
  readonly size = input<HpBarSize>('sm');

  readonly percent = computed(() => {
    const max = this.max();

    if (max <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(100, (this.current() / max) * 100));
  });
}
