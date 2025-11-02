import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { MetaGodPowerManagerService } from 'src/app/core/service/location/meta-god-manager.service';
import { PowerCardComponent } from '../power-card/power-card.component';
import { CommonModule } from '@angular/common';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { MetaGodOption } from 'src/app/database/meta-god/meta-god.type';

@Component({
    selector: 'app-echange',
    templateUrl: './echange.component.html',
    styleUrls: ['./echange.component.scss'],
    imports: [PowerCardComponent, CommonModule],
})
export class EchangeComponent {
    modalCtrl = inject(ModalController);
    metaGodPowerManager = inject(MetaGodPowerManagerService);
    lootManager = inject(LootManagerService);
    constructor() {}

    close() {
        this.modalCtrl.dismiss();
    }

    buyPower(power: MetaGodOption) {
        this.metaGodPowerManager.levelUpPower$(power).subscribe();
    }
}
