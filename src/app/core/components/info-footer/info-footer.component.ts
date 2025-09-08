import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { GameEngineService } from '../../service/game-engine.service';
import { ActionGaugeComponent } from './action-gauge/action-gauge.component';
import { CommonModule } from '@angular/common';
import { HumanManagerService } from '../../service/player/human-manager.service';
import { RegionService } from '../../service/location/region.service';

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
  humanManagerService = inject(HumanManagerService);
  regionService = inject(RegionService);

  travelDuration = input<number>();
  fightingDuration = input<number>();

  travelCountDown$ = this.gameEngineService.getTravelCountDown$();
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

  infoMode: InformationMode = 'fight';

  updateInfoMode(mode: InformationMode) {
    this.infoMode = mode;
  }
}
