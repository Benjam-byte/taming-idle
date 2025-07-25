import { Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';

@Component({
  selector: 'app-empty-area',
  templateUrl: './empty-area.component.html',
  styleUrls: ['./empty-area.component.scss'],
})
export class EmptyAreaComponent {
  gameEngineService = inject(GameEngineService);

  constructor() {}

  changeMap() {
    this.gameEngineService.switchMap();
  }
}
