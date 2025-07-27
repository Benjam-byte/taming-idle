import { Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { sampleTime, Subscription } from 'rxjs';
import { ClickEffectService } from 'src/app/core/service/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import Chest from 'src/app/core/value-object/chest';
import { FloatingMessagesComponent } from 'src/app/core/components/floating-messages/floating-messages.component';

@Component({
  selector: 'app-tresor-area',
  templateUrl: './tresor-area.component.html',
  styleUrls: ['./tresor-area.component.scss'],
  imports: [FloatingMessagesComponent],
})
export class TresorAreaComponent implements OnDestroy {
  gameEngineService = inject(GameEngineService);
  clickEffectService = inject(ClickEffectService);
  @ViewChild('msgDisplay') msgDisplay!: FloatingMessagesComponent;
  chest = new Chest();

  private loop: Subscription | undefined;

  ngOnDestroy(): void {
    this.loop?.unsubscribe();
  }

  startLoop() {
    this.loop = this.gameEngineService
      .getTick$()
      .pipe(sampleTime(this.gameEngineService.human().searchingSpeed))
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
    if (!this.gameEngineService.human().search(now)) return;
    if (this.chest.getCrocheted(0)) {
      this.gameEngineService.submitEventByType('travel');
      this.gameEngineService.human().receiveLoot(this.chest.loot);
    } else {
      this.msgDisplay.showMessage(
        'Failure, try again !' + ' ' + this.chest.try,
        150,
        300
      );
    }
  }
}
