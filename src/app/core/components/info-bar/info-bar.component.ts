import { Component, inject } from '@angular/core';
import { LootManagerService } from '../../service/player/loot-manager.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { PlayerStatPage } from 'src/app/modal/player-stat/player-stat.page';
import { CombatTowerManagerService } from '../../service/location/combat-tower.service';
import { HumanManagerService } from '../../service/player/human-manager.service';
import { RoundToPipe } from '../../pipe/roundTo.pipe';

@Component({
    selector: 'app-info-bar',
    imports: [CommonModule, RoundToPipe],
    templateUrl: './info-bar.component.html',
    styleUrl: './info-bar.component.scss',
})
export class InfoBarComponent {
    modalCtrl = inject(ModalController);
    lootManagerService = inject(LootManagerService);
    humanManagerService = inject(HumanManagerService);
    combatTowerManagerService = inject(CombatTowerManagerService);

    async openPlayerModal() {
        const modal = await this.modalCtrl.create({
            component: PlayerStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
