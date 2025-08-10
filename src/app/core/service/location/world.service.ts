import { Injectable, signal } from '@angular/core';

type availableMap =
  | 'plaine'
  | 'volcan'
  | 'fight tower'
  | 'bermude'
  | 'wind moutain'
  | 'forest';

@Injectable({
  providedIn: 'root',
})
export class WorldService {
  mapUnlocked: availableMap[];
  map: availableMap;
  skillTreeAvailable: boolean;
  offrandeAvailable: boolean;

  constructor() {
    this.map = 'plaine';
    this.skillTreeAvailable = false;
    this.offrandeAvailable = false;
    this.mapUnlocked = ['plaine'];
  }

  evolve(level: number) {
    switch (level) {
      case 2:
        this.enableSkillTree();
        break;
      case 4:
        this.enableOffrande();
        break;
    }
  }

  enableSkillTree() {
    this.skillTreeAvailable = true;
  }

  enableOffrande() {
    this.offrandeAvailable = true;
  }
}
