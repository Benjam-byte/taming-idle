import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  HpBarComponent,
  HpBarSize,
  HpBarTone,
} from '../hp-bar/hp-bar.component';

export type CombatantPanelVariant = 'player' | 'enemy';

@Component({
  selector: 'app-combatant-panel',
  standalone: true,
  imports: [HpBarComponent],
  host: { class: 'block w-full' },
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
  readonly accentColor = input('var(--color-hp-player)');
  readonly badgeColor = input('var(--color-badge-player)');
  readonly hpSize = input<HpBarSize>('sm');

  get hpTone(): HpBarTone {
    return this.variant() === 'enemy' ? 'enemy' : 'player';
  }
}
