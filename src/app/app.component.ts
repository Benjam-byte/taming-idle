import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HumanController } from './database/human/human.controller';
import { CombatTowerController } from './database/combatTower/combatTower.controller';
import { LootController } from './database/loot/loot.controller';
import { ProfessionController } from './database/profession/profession.controller';
import { RegionController } from './database/region/region.controller';
import { WorldController } from './database/world/world.controller';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  humanControllerService = inject(HumanController);
  combatTowerControllerService = inject(CombatTowerController);
  lootControllerService = inject(LootController);
  professionControllerService = inject(ProfessionController);
  regionControllerService = inject(RegionController);
  worldControllerService = inject(WorldController);

  constructor() {
    if (!this.humanControllerService.get()) {
      this.initDatabase();
    }
  }

  initDatabase() {
    this.humanControllerService.init();
    this.combatTowerControllerService.init();
    this.lootControllerService.init();
    this.professionControllerService.init();
    this.regionControllerService.init();
    this.worldControllerService.init();
  }
}
