import { Component, inject, input } from '@angular/core';
import { GameEngineService } from '../../service/game-engine.service';
import { ActionGaugeComponent } from './action-gauge/action-gauge.component';
import { CommonModule } from '@angular/common';
import { HumanManagerService } from '../../service/player/human-manager.service';
import { RegionManagerService } from '../../service/location/region.service';
import { statIconDict } from '../../json/statIconDict';

type InformationMode = 'fight' | 'loot' | 'world' | 'monster';

@Component({
    selector: 'app-info-footer',
    imports: [ActionGaugeComponent, CommonModule],
    templateUrl: './info-footer.component.html',
    styleUrl: './info-footer.component.scss',
})
export class InfoFooterComponent {
    gameEngineService = inject(GameEngineService);
    humanManagerService = inject(HumanManagerService);
    regionService = inject(RegionManagerService);

    travelDuration = input<number>();
    fightingDuration = input<number>();

    statIconDict = statIconDict;

    travelCountDown$ = this.gameEngineService.getTravelCountDown$();
    fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

    infoMode: InformationMode = 'fight';

    updateInfoMode(mode: InformationMode) {
        this.infoMode = mode;
    }
}
