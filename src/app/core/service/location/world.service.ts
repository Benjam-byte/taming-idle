import { effect, inject, Injectable, signal } from '@angular/core';
import { CombatTowerService } from './combat-tower.service';

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
  combatTowerService = inject(CombatTowerService);

  mapUnlocked: availableMap[];
  map: availableMap;
  skillTreeAvailable: boolean;
  offrandeAvailable: boolean;

  constructor() {
    this.map = 'plaine';
    this.skillTreeAvailable = false;
    this.offrandeAvailable = false;
    this.mapUnlocked = ['plaine'];

    const towerPath = localStorage.getItem('towerPath');
    if (towerPath !== null) {
      const parsedTowerPath = JSON.parse(towerPath);
      this.skillTreeAvailable = Boolean(parsedTowerPath.skillTreeAvailable);
      this.offrandeAvailable = Boolean(parsedTowerPath.offrandeAvailable);
    } else {
      this.store();
    }

    effect(() => {
      this.evolve(this.combatTowerService.level());
    });
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
    this.store();
  }

  enableOffrande() {
    this.offrandeAvailable = true;
    this.store();
  }

  store() {
    const towerPath = {
      skillTreeAvailable: this.skillTreeAvailable,
      offrandeAvailable: this.offrandeAvailable,
    };
    localStorage.setItem('towerPath', JSON.stringify(towerPath));
  }
}
