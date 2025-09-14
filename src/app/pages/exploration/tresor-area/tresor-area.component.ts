import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { sampleTime, Subscription } from 'rxjs';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import Chest from 'src/app/core/value-object/chest';
import { FloatingMessagesComponent } from 'src/app/core/components/floating-messages/floating-messages.component';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { WorldService } from 'src/app/core/service/location/world.service';

@Component({
  selector: 'app-tresor-area',
  templateUrl: './tresor-area.component.html',
  styleUrls: ['./tresor-area.component.scss'],
  imports: [FloatingMessagesComponent],
})
export class TresorAreaComponent implements OnDestroy {
  @ViewChild('msgDisplay') msgDisplay!: FloatingMessagesComponent;
  gameEngineService = inject(GameEngineService);
  humanManagerService = inject(HumanManagerService);
  lootManagerService = inject(LootManagerService);
  worldManagerService = inject(WorldService);
  clickEffectService = inject(ClickEffectService);
  broadcastService = inject(BroadcastService);
  chest = new Chest();

  private loop: Subscription | undefined;

  ngOnDestroy(): void {
    this.loop?.unsubscribe();
  }

  startLoop() {
    this.loop = this.gameEngineService
      .getTick$()
      .pipe(sampleTime(this.humanManagerService.human.searchingSpeed))
      .subscribe((now) => {
        this.crochetage(now);
      });
  }

  stopLoop() {
    if (this.loop) {
      this.loop.unsubscribe();
      this.loop = undefined;
    }
  }

  crochetage(now: number) {
    if (!this.humanManagerService.search(now)) return;
    if (
      this.chest.getCrocheted(
        this.humanManagerService.human.unlockChestBonusChancePercentage
      )
    ) {
      this.lootChest();
    } else {
      this.msgDisplay.showMessage(
        'Failure, try again !' + ' ' + this.chest.try,
        150,
        300
      );
    }
  }

  lootChest() {
    let loot = '';
    if (this.worldManagerService.world.metaGodAvailable) {
      loot = this.chest.openChest();
    } else {
      loot = 'relicRank1';
    }
    this.lootManagerService.lootChest(loot);
    this.broadcastService.displayMessage({ message: `Vous obtenez ${loot}` });
    this.gameEngineService.submitEventByType('travel');
  }
}
