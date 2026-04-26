import { Component, output } from '@angular/core';

@Component({
  selector: 'app-player-bar',
  templateUrl: './player-bar.component.html',
  styleUrls: ['./player-bar.component.scss'],
})
export class PlayerBarComponent {
  playerName = 'Player';
  currentHp = 80;
  maxHp = 100;
  damage = 10;

  flee = output();

  get hpPercent(): number {
    if (this.maxHp <= 0) return 0;

    return Math.max(0, Math.min(100, (this.currentHp / this.maxHp) * 100));
  }
}
