import { Component, inject } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';

@Component({
  selector: 'app-tresor-area',
  templateUrl: './tresor-area.component.html',
  styleUrls: ['./tresor-area.component.scss'],
})
export class TresorAreaComponent {
  gameEngineService = inject(GameEngineService);
  clickEffectService = inject(ClickEffectService);

  constructor() {}

  onClick(event: MouseEvent) {
    this.clickEffectService.spawnClickEffect(event);
    this.gameEngineService.submitEventByType('travel');
  }
}
