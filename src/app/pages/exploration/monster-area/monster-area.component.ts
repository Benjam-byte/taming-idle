import { Component, output } from '@angular/core';

@Component({
  selector: 'app-monster-area',
  templateUrl: './monster-area.component.html',
  styleUrls: ['./monster-area.component.scss'],
})
export class MonsterAreaComponent {
  nextMap = output<void>();

  constructor() {}

  changeMap() {
    this.nextMap.emit();
  }
}
