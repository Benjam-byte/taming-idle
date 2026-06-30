import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { HpBarComponent } from '../hp-bar/hp-bar.component';
import { HpBarSize } from '../hp-bar/hp.type';

export type CombatantPanelVariant = 'player' | 'enemy';

@Component({
  selector: 'app-combatant-panel',
  standalone: true,
  imports: [HpBarComponent],
  templateUrl: './combatant-panel.component.html',
  styleUrl: './combatant-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatantPanelComponent {
  readonly variant = input<CombatantPanelVariant>('player');
  readonly name = input('???');
  readonly statLabel = input('');
  readonly statValue = input<number | string>('');
  readonly currentHp = input(0);
  readonly maxHp = input(0);
  readonly hpSize = input<HpBarSize>('sm');

  readonly isEnemy = computed(() => this.variant() === 'enemy');
  readonly hasStat = computed(() => this.statLabel().length > 0);
}
