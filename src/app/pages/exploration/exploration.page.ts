import { Component, computed, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { EmptyAreaComponent } from './empty-area/empty-area.component';
import { TresorAreaComponent } from './tresor-area/tresor-area.component';
import { MonsterAreaComponent } from './monster-area/monster-area.component';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { InfoBarComponent } from 'src/app/core/components/info-bar/info-bar.component';

@Component({
  selector: 'app-exploration',
  templateUrl: 'exploration.page.html',
  styleUrls: ['exploration.page.scss'],
  imports: [
    IonContent,
    EmptyAreaComponent,
    TresorAreaComponent,
    MonsterAreaComponent,
    InfoBarComponent,
  ],
})
export class ExplorationPage {
  gameEngineService = inject(GameEngineService);
  currentMap = computed(() => this.gameEngineService.currentMap());

  constructor() {}
}
