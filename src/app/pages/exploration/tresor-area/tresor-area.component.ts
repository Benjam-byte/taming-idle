import { Component, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-tresor-area',
  templateUrl: './tresor-area.component.html',
  styleUrls: ['./tresor-area.component.scss'],
})
export class TresorAreaComponent {
  nextMap = output<void>();

  constructor() {}

  changeMap() {
    this.nextMap.emit();
  }
}
