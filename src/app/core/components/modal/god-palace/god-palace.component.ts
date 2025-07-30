import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { WorldMapComponent } from '../world-map/world-map.component';

@Component({
  selector: 'app-god-palace',
  imports: [IonContent, CommonModule],
  templateUrl: './god-palace.component.html',
  styleUrl: './god-palace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GodPalaceComponent {
  gameEngineService = inject(GameEngineService);
  modalCtrl = inject(ModalController);
  close() {
    this.modalCtrl.dismiss();
  }

  openWorldMapModal() {
    this.close();
    this.openWorldModal();
  }

  async openWorldModal() {
    const modal = await this.modalCtrl.create({
      component: WorldMapComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }
}
