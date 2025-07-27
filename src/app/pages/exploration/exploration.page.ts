import { Component, computed, effect, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { EmptyAreaComponent } from './empty-area/empty-area.component';
import { TresorAreaComponent } from './tresor-area/tresor-area.component';
import { MonsterAreaComponent } from './monster-area/monster-area.component';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { InfoBarComponent } from 'src/app/core/components/info-bar/info-bar.component';
import { CommonModule } from '@angular/common';
import { IconProgressComponent } from 'src/app/core/components/icon-progress/icon-progress.component';
import { WorldMapComponent } from 'src/app/core/components/modal/world-map/world-map.component';

@Component({
  selector: 'app-exploration',
  templateUrl: 'exploration.page.html',
  styleUrls: ['exploration.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    EmptyAreaComponent,
    TresorAreaComponent,
    MonsterAreaComponent,
    InfoBarComponent,
    IconProgressComponent,
  ],
})
export class ExplorationPage {
  gameEngineService = inject(GameEngineService);
  modalCtrl = inject(ModalController);
  currentMap = computed(() => this.gameEngineService.currentMap());

  travelCountDown$ = this.gameEngineService.getTravelCountDown$();
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();
  SearchingCountDown$ = this.gameEngineService.getSearchingCountDown$();

  travelDuration = this.gameEngineService.human().travellingSpeed;
  fightingDuration = this.gameEngineService.human().fightingSpeed;
  searchDuration = this.gameEngineService.human().searchingSpeed;

  images = [
    'assets/map/plaine/Plaine_1.png',
    'assets/map/plaine/Plaine_2.png',
    'assets/map/plaine/Plaine_3.png',
    'assets/map/plaine/Plaine_4.png',
    'assets/map/plaine/Plaine_5.png',
    'assets/map/plaine/Plaine_6.png',
  ];

  imageUrl = '';
  previousImageUrl: string | null = null;
  imageLoaded = false;

  constructor() {
    effect(() => {
      const value = this.currentMap();
      if (value) this.changeBackgroundImage(this.getRandomImage());
    });
  }

  getRandomImage(): string {
    const index = Math.floor(Math.random() * this.images.length);
    return this.images[index];
  }

  changeBackgroundImage(newUrl: string) {
    this.previousImageUrl = this.imageUrl;
    this.imageUrl = newUrl;
    this.imageLoaded = false;
  }

  onImageLoad() {
    this.imageLoaded = true;

    setTimeout(() => {
      this.previousImageUrl = null;
    }, 100);
  }

  async openWorldMapModal() {
    const modal = await this.modalCtrl.create({
      component: WorldMapComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }

  emitEvent(event: string) {
    this.gameEngineService.submitEventByType(event);
  }
}
