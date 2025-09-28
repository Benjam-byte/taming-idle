import { Component, inject, input } from '@angular/core';
import { GameEngineService } from '../../service/game-engine.service';
import { CommonModule } from '@angular/common';
import { HumanManagerService } from '../../service/player/human-manager.service';
import { RegionManagerService } from '../../service/location/region.service';
import { statIconDict } from '../../json/statIconDict';
import { ModalController } from '@ionic/angular/standalone';
import { MenuComponent } from 'src/app/modal/menu/menu.component';

type InformationMode = 'fight' | 'loot' | 'world' | 'monster';

@Component({
    selector: 'app-info-footer',
    imports: [CommonModule],
    templateUrl: './info-footer.component.html',
    styleUrl: './info-footer.component.scss',
})
export class InfoFooterComponent {
    gameEngineService = inject(GameEngineService);
    humanManagerService = inject(HumanManagerService);
    regionService = inject(RegionManagerService);
    modalCtrl = inject(ModalController);

    travelDuration = input<number>();
    fightingDuration = input<number>();

    statIconDict = statIconDict;

    travelCountDown$ = this.gameEngineService.getTravelCountDown$();
    fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

    infoMode: InformationMode = 'fight';

    updateInfoMode(mode: InformationMode) {
        this.infoMode = mode;
    }

    async openMenuModal() {
        const modal = await this.modalCtrl.create({
            component: MenuComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
