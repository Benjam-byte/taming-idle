import { Component, input } from '@angular/core';
import { CombatantPanelComponent } from 'src/app/screen/main/combat/combatant-panel/combatant-panel.component';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  templateUrl: './player-bar.component.html',
  imports: [CombatantPanelComponent],
})
export class PlayerBarComponent {
  playerName = 'Terra larva';
  currentHp = input(0);
  maxHp = input(0);
  damage = 10;
}
