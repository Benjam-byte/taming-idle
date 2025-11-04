import {
    Component,
    DestroyRef,
    inject,
    OnDestroy,
    ViewChild,
} from '@angular/core';
import { sampleTime, Subscription } from 'rxjs';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import Chest from 'src/app/core/value-object/chest';
import { FloatingMessagesComponent } from 'src/app/core/components/floating-messages/floating-messages.component';
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { AssignedMonsterManagerService } from 'src/app/core/service/player/assigned-monster-manager.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tresor-area',
    templateUrl: './tresor-area.component.html',
    styleUrls: ['./tresor-area.component.scss'],
    imports: [FloatingMessagesComponent],
})
export class TresorAreaComponent {
    @ViewChild('msgDisplay') msgDisplay!: FloatingMessagesComponent;
    lootManager = inject(LootManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    destroyRef = inject(DestroyRef);
    gameEngineService = inject(GameEngineService);
    broadcastService = inject(BroadcastService);
    clickEffectService = inject(ClickEffectService);

    chest = new Chest();

    private loop: Subscription | undefined;

    startLoop() {
        this.stopLoop();
        this.loop = this.gameEngineService
            .getTick$()
            .pipe(
                sampleTime(
                    this.assignedMonsterManager.assignedMonster.lockPickingSpeed
                ),
                takeUntilDestroyed(this.destroyRef)
            )
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
        if (!this.assignedMonsterManager.search(now)) return;
        this.assignedMonsterManager.xpByProfessionName$('Voleur').subscribe();
        if (this.chest.getCrocheted() === 1) {
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
        let loot = this.chest.openChest();
        loot = this.lootManager.lootChest(loot);
        this.broadcastService.displayMessage({
            message: `Vous obtenez ${loot}`,
        });
        this.gameEngineService.submitEventByType('end');
    }
}
