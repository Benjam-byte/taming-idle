import { Component, computed, effect, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { EmptyAreaComponent } from './empty-area/empty-area.component';
import { TresorAreaComponent } from './tresor-area/tresor-area.component';
import { MonsterAreaComponent } from './monster-area/monster-area.component';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { InfoBarComponent } from 'src/app/core/components/info-bar/info-bar.component';
import { CommonModule } from '@angular/common';
import { WorldMapComponent } from 'src/app/modal/world-map/world-map.component';
import { GodPalaceComponent } from 'src/app/modal/god-palace/god-palace.component';
import { SkillTreeComponent } from 'src/app/modal/skill-tree/skill-tree.component';
import { InfoFooterComponent } from 'src/app/core/components/info-footer/info-footer.component';
import { MapService } from 'src/app/core/service/location/map.service';
import { WorldService } from 'src/app/core/service/location/world.service';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';

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
    InfoFooterComponent,
  ],
})
export class ExplorationPage {
  gameEngineService = inject(GameEngineService);
  humanManagerService = inject(HumanManagerService);
  mapService = inject(MapService);
  modalCtrl = inject(ModalController);
  worldService = inject(WorldService);
  currentMap = computed(() => this.mapService.map().content());

  travelCountDown$ = this.gameEngineService.getTravelCountDown$();
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();
  SearchingCountDown$ = this.gameEngineService.getSearchingCountDown$();

  travelDuration = this.humanManagerService.travellingSpeed;
  fightingDuration = this.humanManagerService.fightingSpeed;
  searchDuration = this.humanManagerService.searchingSpeed;

  images = [
    'assets/map/plaine/Plaine_1.webp',
    'assets/map/plaine/Plaine_2.webp',
    'assets/map/plaine/Plaine_3.webp',
    'assets/map/plaine/Plaine_4.webp',
    'assets/map/plaine/Plaine_5.webp',
    'assets/map/plaine/Plaine_6.webp',
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

  async openGodPalaceModal() {
    const modal = await this.modalCtrl.create({
      component: GodPalaceComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }

  async openSkillTreeModal() {
    const modal = await this.modalCtrl.create({
      component: SkillTreeComponent,
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
