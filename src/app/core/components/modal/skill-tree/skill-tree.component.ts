import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { SkillLineComponent } from './skill-line/skill-line.component';
import { CommonModule } from '@angular/common';
import { WorldMapComponent } from '../world-map/world-map.component';
import { GameEngineService } from 'src/app/core/service/game-engine.service';

@Component({
  selector: 'app-skill-tree',
  imports: [IonContent, SkillLineComponent, CommonModule],
  templateUrl: './skill-tree.component.html',
  styleUrl: './skill-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillTreeComponent {
  modalCtrl = inject(ModalController);
  gameEngineService = inject(GameEngineService);

  selectedProfessionIndex = signal<number>(0);
  selectedProfession = computed(
    () =>
      this.gameEngineService.human().professionList[
        this.selectedProfessionIndex()
      ]
  );

  close() {
    this.modalCtrl.dismiss();
  }

  openWorldMapModal() {
    this.close();
    this.openWorldModal();
  }

  next() {
    const total = this.gameEngineService.human().professionList.length;
    this.selectedProfessionIndex.update((i) => (i + 1) % total);
  }

  previous() {
    const total = this.gameEngineService.human().professionList.length;
    this.selectedProfessionIndex.update((i) => (i - 1 + total) % total);
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
