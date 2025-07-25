import { Injectable, signal } from '@angular/core';
import Human from '../value-object/human';

type MapKey = 'tresor' | 'monster' | 'empty';

@Injectable({
  providedIn: 'root',
})
export class GameEngineService {
  currentMap = signal<string>('empty');
  human = signal<Human>(new Human(1));
  lastMovementTime = 0;

  constructor() {}

  mapDict: Record<MapKey, number> = {
    tresor: 1 / 10,
    monster: 1 / 10,
    empty: 8 / 10,
  };

  switchMap() {
    const now = Date.now();
    if (now - this.lastMovementTime >= this.human().travellingSpeed) {
      this.currentMap.update(() => this.getRandomMap());
      this.human().advance();
      this.lastMovementTime = now;
    }
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
