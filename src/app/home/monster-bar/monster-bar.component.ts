import { Component, input } from '@angular/core';
import { CombatantPanelComponent } from 'src/app/ui/combatant-panel/combatant-panel.component';

@Component({
  selector: 'app-monster-bar',
  standalone: true,
  templateUrl: './monster-bar.component.html',
  imports: [CombatantPanelComponent],
})
export class MonsterBarComponent {
  monsterName = input('???');
  currentHp = input(0);
  maxHp = input(0);
  power = 12;
}
