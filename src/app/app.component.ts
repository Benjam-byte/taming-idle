import { Component, inject, signal } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HumanController } from './database/human/human.controller';
import { CombatTowerController } from './database/combatTower/combatTower.controller';
import { LootController } from './database/loot/loot.controller';
import { ProfessionController } from './database/profession/profession.controller';
import { RegionController } from './database/region/region.controller';
import { WorldController } from './database/world/world.controller';
import { DatabaseService } from './database/database.service';
import { concat, forkJoin } from 'rxjs';
import { CombatTowerManagerService } from './core/service/location/combat-tower.service';
import { GodController } from './database/god/god.controller';
import { GodPalaceManagerService } from './core/service/location/god-palace.service';
import { BestiaryManagerService } from './core/service/monster/bestiary-manager.service';
import { BestiaryController } from './database/bestiary/bestiary.controller';
import { RelicsController } from './database/relics/relics.controller';
import { RelicManagerService } from './core/service/player/relic-manager.service';
import { RegionManagerService } from './core/service/location/region.service';

const VERSION = 2;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  databaseService = inject(DatabaseService);
  humanControllerService = inject(HumanController);
  combatTowerControllerService = inject(CombatTowerController);
  lootControllerService = inject(LootController);
  professionControllerService = inject(ProfessionController);
  regionControllerService = inject(RegionController);
  worldControllerService = inject(WorldController);
  godControllerService = inject(GodController);
  bestiaryControllerService = inject(BestiaryController);
  relicControllerService = inject(RelicsController);

  regionManagerService = inject(RegionManagerService);
  relicManagerService = inject(RelicManagerService);
  bestiaryManagerService = inject(BestiaryManagerService);
  combatTowerService = inject(CombatTowerManagerService);
  godPalaceService = inject(GodPalaceManagerService);

  isReady = signal<boolean>(false);

  constructor() {
    const dbInitialized = localStorage.getItem('db');

    if (dbInitialized === null) {
      this.initDatabase$().subscribe(() => {
        localStorage.setItem('db', JSON.stringify(VERSION));
        this.isReady.set(true);
      });
    } else if (+dbInitialized !== VERSION) {
      concat(this.dropDatabase$(), this.initDatabase$()).subscribe(() => {
        localStorage.setItem('db', JSON.stringify(VERSION));
        this.isReady.set(true);
      });
    } else {
      this.isReady.set(true);
    }
  }

  initDatabase$() {
    return forkJoin([
      this.humanControllerService.init(),
      this.combatTowerControllerService.init(),
      this.lootControllerService.init(),
      this.professionControllerService.init(),
      this.regionControllerService.init(),
      this.worldControllerService.init(),
      this.godControllerService.init(),
      this.bestiaryControllerService.init(),
      this.relicControllerService.init(),
    ]);
  }

  dropDatabase$() {
    return forkJoin([
      this.humanControllerService.dropTable(),
      this.combatTowerControllerService.dropTable(),
      this.lootControllerService.dropTable(),
      this.professionControllerService.dropTable(),
      this.regionControllerService.dropTable(),
      this.worldControllerService.dropTable(),
      this.godControllerService.dropTable(),
      this.bestiaryControllerService.dropTable(),
      this.relicControllerService.dropTable(),
    ]);
  }
}
