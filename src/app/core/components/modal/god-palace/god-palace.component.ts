import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
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

  godList = this.gameEngineService.godList();
  readonly selectedIndex = signal(0);
  readonly selectedGod = computed(() => this.godList[this.selectedIndex()]);

  close() {
    this.modalCtrl.dismiss();
  }

  next(): void {
    const current = this.selectedIndex();
    const total = this.godList.length;
    this.selectedIndex.update(() => (current + 1) % total);
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
