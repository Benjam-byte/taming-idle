import { Component, input } from '@angular/core';

@Component({
  selector: 'app-monster-bar',
  templateUrl: './monster-bar.component.html',
  styleUrls: ['./monster-bar.component.scss'],
})
export class MonsterBarComponent {
  monsterName = input('???');
  currentHp = input(0);
  maxHp = input(0);
  power = 12;

  get hpPercent(): number {
    if (this.maxHp() <= 0) return 0;

    return Math.max(0, Math.min(100, (this.currentHp() / this.maxHp()) * 100));
  }
}
