import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { WorldMapComponent } from '../world-map/world-map.component';
import { MetaGodPalaceComponent } from '../meta-god-palace/meta-god-palace.component';
import { GodService } from 'src/app/core/service/location/god-palace.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-god-palace',
  imports: [IonContent, CommonModule],
  templateUrl: './god-palace.component.html',
  styleUrl: './god-palace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GodPalaceComponent {
  modalCtrl = inject(ModalController);
  godPalaceService = inject(GodService);

  readonly godList = toSignal(this.godPalaceService.godList$, {
    initialValue: [],
  });
  readonly selectedIndex = signal(0);
  readonly selectedGod = computed(() => {
    const godList = this.godList();
    const selectedIndex = this.selectedIndex();
    if (!godList) return;
    return godList[selectedIndex];
  });

  close() {
    this.modalCtrl.dismiss();
  }

  next(): void {
    const current = this.selectedIndex();
    const total = this.godPalaceService.godList.length;
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

  goToMetaPalace() {
    const selectedGod = this.selectedGod();
    if (selectedGod) {
      if (selectedGod.name !== 'Meta fracture') return;
      this.close();
      this.openMetaGodModal();
    }
  }

  async openMetaGodModal() {
    const modal = await this.modalCtrl.create({
      component: MetaGodPalaceComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }
}
