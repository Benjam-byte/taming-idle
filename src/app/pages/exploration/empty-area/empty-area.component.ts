import { Component, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-empty-area',
  templateUrl: './empty-area.component.html',
  styleUrls: ['./empty-area.component.scss'],
})
export class EmptyAreaComponent {
  nextMap = output<void>();

  constructor() {}

  changeMap() {
    this.nextMap.emit();
  }
}
