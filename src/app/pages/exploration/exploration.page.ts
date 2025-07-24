import { Component, signal } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
} from '@ionic/angular/standalone';
import { EmptyAreaComponent } from './empty-area/empty-area.component';
import { TresorAreaComponent } from './tresor-area/tresor-area.component';
import { MonsterAreaComponent } from './monster-area/monster-area.component';

type MapKey = 'tresor' | 'monster' | 'empty';

@Component({
  selector: 'app-exploration',
  templateUrl: 'exploration.page.html',
  styleUrls: ['exploration.page.scss'],
  imports: [
    IonContent,
    EmptyAreaComponent,
    TresorAreaComponent,
    MonsterAreaComponent,
  ],
})
export class ExplorationPage {
  constructor() {}

  currentMap = signal<string>('empty');

  mapDict: Record<MapKey, number> = {
    tresor: 1 / 10,
    monster: 1 / 10,
    empty: 8 / 10,
  };

  action() {
    this.currentMap.update(() => this.getRandomMap());
  }

  private getRandomMap(): MapKey {
    const rand = Math.random();
    let cumulative = 0;

    for (const [key, prob] of Object.entries(this.mapDict)) {
      cumulative += prob;
      if (rand < cumulative) {
        return key as MapKey;
      }
    }

    return 'empty';
  }
}
