import { Component, inject } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';

@Component({
  selector: 'app-empty-area',
  templateUrl: './empty-area.component.html',
  styleUrls: ['./empty-area.component.scss'],
  imports: [],
})
export class EmptyAreaComponent {
  gameEngineService = inject(GameEngineService);
  clickEffectService = inject(ClickEffectService);

  constructor() {}

  onClick(event: MouseEvent) {
    this.clickEffectService.spawnClickEffect(event);
    this.gameEngineService.submitEventByType('travel');
  }
}
