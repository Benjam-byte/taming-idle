import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { GameEngineService } from '../../service/game-engine.service';
import { ActionGaugeComponent } from './action-gauge/action-gauge.component';
import { CommonModule } from '@angular/common';
import { RegionManagerService } from '../../service/location/region-manager.service';
import { HumanManagerService } from '../../service/player/human-manager.service';
import { Human } from 'src/app/database/human/human.type';

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
  regionManagerService = inject(RegionManagerService);
  humanManagerService = inject(HumanManagerService);

  travelDuration = input<number>();
  fightingDuration = input<number>();

  travelCountDown$ = this.gameEngineService.getTravelCountDown$();
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

  infoMode: InformationMode = 'fight';
  region = this.regionManagerService.currentRegion();

  updateInfoMode(mode: InformationMode) {
    this.infoMode = mode;
  }
}
