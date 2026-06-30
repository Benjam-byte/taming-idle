import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { HpBarSize, HpBarState } from './hp.type';

const criticalHealthPercentThreshold = 10;
const warningHealthPercentThreshold = 35;

@Component({
  selector: 'app-hp-bar',
  standalone: true,
  templateUrl: './hp-bar.component.html',
  styleUrl: './hp-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HpBarComponent {
  readonly currentHealth = input(0);
  readonly maxHealth = input(0);
  readonly size = input<HpBarSize>('sm');

  readonly maxHealthValue = computed(() => Math.max(0, this.maxHealth()));

  readonly currentHealthValue = computed(() => {
    const currentHealth = Math.max(0, this.currentHealth());
    const maxHealth = this.maxHealthValue();

    if (maxHealth <= 0) {
      return 0;
    }

    return Math.min(currentHealth, maxHealth);
  });

  readonly healthPercent = computed(() => {
    const maxHealth = this.maxHealthValue();

    if (maxHealth <= 0) {
      return 0;
    }

    return (this.currentHealthValue() / maxHealth) * 100;
  });

  readonly healthState = computed<HpBarState>(() => {
    const healthPercent = this.healthPercent();

    if (healthPercent < criticalHealthPercentThreshold) {
      return 'critical';
    }

    if (healthPercent < warningHealthPercentThreshold) {
      return 'warning';
    }

    return 'healthy';
  });

  readonly healthValueText = computed(
    () => `${this.currentHealthValue()} / ${this.maxHealthValue()} PV`,
  );

  readonly hasHealth = computed(() => this.currentHealthValue() > 0);
}
