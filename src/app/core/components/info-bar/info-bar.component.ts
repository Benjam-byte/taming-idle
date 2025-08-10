import { Component, computed, inject } from '@angular/core';
import { GameEngineService } from '../../service/game-engine.service';
import { ModalController } from '@ionic/angular/standalone';
import { HumanStatComponent } from '../../../../app/modal/human-stat/human-stat.component';
import { LootManagerService } from '../../service/player/loot-manager.service';

@Component({
  selector: 'app-info-bar',
  imports: [],
  templateUrl: './info-bar.component.html',
  styleUrl: './info-bar.component.scss',
})
export class InfoBarComponent {
  gameEngineService = inject(GameEngineService);
  lootManagerService = inject(LootManagerService);
  human = computed(() => this.gameEngineService.human());
  modalCtrl = inject(ModalController);

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: HumanStatComponent,
      cssClass: 'small-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }
}
