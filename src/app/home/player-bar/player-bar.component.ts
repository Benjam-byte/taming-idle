import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-player-bar',
  templateUrl: './player-bar.component.html',
  styleUrls: ['./player-bar.component.scss'],
})
export class PlayerBarComponent {
  playerName = 'Terra larva';
  currentHp = input(0);
  maxHp = input(0);
  damage = 10;

  flee = output();

  get hpPercent(): number {
    if (this.maxHp() <= 0) return 0;

    return Math.max(0, Math.min(100, (this.currentHp() / this.maxHp()) * 100));
  }
}
