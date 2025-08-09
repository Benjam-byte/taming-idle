import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { GameEngineService } from '../../service/game-engine.service';
import { ActionGaugeComponent } from './action-gauge/action-gauge.component';
import { CommonModule } from '@angular/common';

type InformationMode = 'fight' | 'loot' | 'world' | 'monster';

@Component({
  selector: 'app-info-footer',
  imports: [ActionGaugeComponent, CommonModule],
  templateUrl: './info-footer.component.html',
  styleUrl: './info-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoFooterComponent {
  gameEngineService = inject(GameEngineService);
  human = computed(() => this.gameEngineService.human());
  travelCountDown$ = this.gameEngineService.getTravelCountDown$();
  travelDuration = this.gameEngineService.human().travellingSpeed;
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();
  fightingDuration = this.gameEngineService.human().fightingSpeed;

  infoMode: InformationMode = 'fight';

  updateInfoMode(mode: InformationMode) {
    console.log(mode);
    this.infoMode = mode;
  }
}
