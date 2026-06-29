import { Component, input, output } from '@angular/core';
import { CombatantPanelComponent } from 'src/app/ui/combatant-panel/combatant-panel.component';
import { IconButtonComponent } from 'src/app/ui/icon-button/icon-button.component';

@Component({
  selector: 'app-player-bar',
  standalone: true,
  templateUrl: './player-bar.component.html',
  imports: [CombatantPanelComponent, IconButtonComponent],
})
export class PlayerBarComponent {
  playerName = 'Terra larva';
  currentHp = input(0);
  maxHp = input(0);
  damage = 10;

  flee = output();
}
