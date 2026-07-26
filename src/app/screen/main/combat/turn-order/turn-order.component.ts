import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { CombatTurnActor } from 'src/app/core/service/combat/combat.store';

@Component({
  selector: 'app-combat-turn-order',
  standalone: true,
  templateUrl: './turn-order.component.html',
  styleUrl: './turn-order.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnOrderComponent {
  readonly turns = input.required<readonly CombatTurnActor[]>();

  getPortraitPath(actor: CombatTurnActor): string {
    return actor === 'player'
      ? 'assets/monster/terra_larva/Terra_larva.webp'
      : 'assets/monster/slime/Slime_Base.webp';
  }

  getPortraitAlt(actor: CombatTurnActor): string {
    return actor === 'player' ? 'Terra larva' : 'Slime';
  }
}
