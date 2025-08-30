import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HumanController } from './database/human/human.controller';
import { CombatTowerController } from './database/combatTower/combatTower.controller';
import { LootController } from './database/loot/loot.controller';
import { ProfessionController } from './database/profession/profession.controller';
import { RegionController } from './database/region/region.controller';
import { WorldController } from './database/world/world.controller';
import { DatabaseService } from './database/database.service';

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

  constructor() {
    const dbInitialized = localStorage.getItem('db');

    if (dbInitialized === null) {
      this.initDatabase();
      localStorage.setItem('db', JSON.stringify(true));
    }
  }

  initDatabase() {
    this.humanControllerService.init().subscribe();
    this.combatTowerControllerService.init().subscribe();
    this.lootControllerService.init().subscribe();
    this.professionControllerService.init().subscribe();
    this.regionControllerService.init().subscribe();
    this.worldControllerService.init().subscribe();
  }
}
