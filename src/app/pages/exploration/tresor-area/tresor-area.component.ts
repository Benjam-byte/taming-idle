import { Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';

@Component({
  selector: 'app-tresor-area',
  templateUrl: './tresor-area.component.html',
  styleUrls: ['./tresor-area.component.scss'],
})
export class TresorAreaComponent {
  gameEngineService = inject(GameEngineService);

  constructor() {}

  changeMap() {
    this.gameEngineService.switchMap();
  }
}
