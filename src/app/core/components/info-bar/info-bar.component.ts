import { Component, inject } from '@angular/core';
import { LootManagerService } from '../../service/player/loot-manager.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { PlayerStatPage } from 'src/app/modal/player-stat/player-stat.page';

@Component({
    selector: 'app-info-bar',
    imports: [CommonModule],
    templateUrl: './info-bar.component.html',
    styleUrl: './info-bar.component.scss',
})
export class InfoBarComponent {
    modalCtrl = inject(ModalController);
    lootManagerService = inject(LootManagerService);

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
