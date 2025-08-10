import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FightTowerComponent } from '../fight-tower/fight-tower.component';
import { WorldService } from 'src/app/core/service/location/world.service';

@Component({
  selector: 'app-world-map',
  imports: [IonContent, CommonModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent {
  worldService = inject(WorldService);
  modalCtrl = inject(ModalController);

  onZoneClick(zone: string) {
    console.log('Zone cliquée :', zone);
    if (zone === 'fight tower') {
      this.openFightTowerModal();
      this.close();
    }
    if (zone === this.worldService.map) this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async openFightTowerModal() {
    const modal = await this.modalCtrl.create({
      component: FightTowerComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }
}
