import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { ModalController } from '@ionic/angular/standalone';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { CommonModule } from '@angular/common';
import { WorldManagerService } from 'src/app/core/service/location/world.service';
import { Gisement } from 'src/app/database/world/world.type';
import { forkJoin } from 'rxjs';
import {
    formatTimeFromMs,
    timeUntilAvailable,
} from 'src/app/core/helpers/time-format';

@Component({
    selector: 'app-fontaine',
    imports: [ModalLayoutComponent, CommonModule],
    templateUrl: './fontaine.component.html',
    styleUrl: './fontaine.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FontaineComponent {
    modalCtrl = inject(ModalController);
    clickEffectService = inject(ClickEffectService);
    lootManager = inject(LootManagerService);
    worldManager = inject(WorldManagerService);

    life = signal<number>(0);

    constructor() {
        this.worldManager.world$.subscribe((world) => {
            if (this.isAvailable(world.gisement)) {
                this.life.set(3);
            }
        });
    }

    isAvailable(gisement: Gisement) {
        return Date.now() >= gisement.nextAvailableAt;
    }

    setLife() {
        this.life.update((life) => life - 1);
        if (this.life() === 0) {
            forkJoin([
                this.worldManager.collectedGisement$(),
                this.lootManager.addGlitchedStone$(3),
            ]).subscribe();
        }
    }

    onClick(event: MouseEvent, gisement: Gisement) {
        if (!this.isAvailable(gisement)) return;
        this.clickEffectService.spawnCollectFontaineEffect(event, 1);
        this.setLife();
    }

    gisementNextTime(time: number) {
        return timeUntilAvailable(time);
    }
}
