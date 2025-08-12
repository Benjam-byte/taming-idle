import { effect, inject, Injectable, signal } from '@angular/core';
import { CombatTowerService } from './combat-tower.service';
import { BroadcastService } from '../Ui/broadcast.service';

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
  broadcastMessageService = inject(BroadcastService);

  mapUnlocked: availableMap[];
  map: availableMap;
  skillTreeAvailable: boolean;
  offrandeAvailable: boolean;
  isInit = true;

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
      case 1:
        if (this.isInit) break;
        this.broadcastMessageService.displayMessage({
          message: 'Word is evolving, monster are born',
        });
        break;
      case 2:
        this.enableSkillTree();
        if (this.isInit) break;
        this.broadcastMessageService.displayMessage({
          message: 'Skill tree is now available',
        });
        break;
      case 3:
        if (this.isInit) break;
        this.broadcastMessageService.displayMessage({
          message: 'keep the good work, worl power is growing',
        });
        break;
      case 4:
        this.enableOffrande();
        if (this.isInit) break;
        this.broadcastMessageService.displayMessage({
          message: 'Gods want to talk with you',
        });
        break;
    }
    this.isInit = false;
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
