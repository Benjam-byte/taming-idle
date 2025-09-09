import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { God } from 'src/app/database/god/god.type';

@Component({
  selector: 'app-meta-god-palace',
  imports: [IonContent, CommonModule],
  templateUrl: './meta-god-palace.component.html',
  styleUrl: './meta-god-palace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaGodPalaceComponent {
  modalCtrl = inject(ModalController);
  metaGod: God = {
    id: '0',
    name: '.?xexs?',
    description: '...',
    imagePath: 'assets/altar/Altar_MetaGod.webp',
    offering: { price: 0, statGain: 0, ressource: '' },
    order: 6,
  };

  close() {
    this.modalCtrl.dismiss();
  }
}
