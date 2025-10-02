import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { RelicManagerService } from 'src/app/core/service/player/relic-manager.service';
import { Relics } from 'src/app/database/relics/relics.type';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
import { statIconDict } from 'src/app/core/json/statIconDict';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';

@Component({
    selector: 'app-player-stat',
    templateUrl: './player-stat.page.html',
    styleUrls: ['./player-stat.page.scss'],
    standalone: true,
    imports: [IonContent, CommonModule, FormsModule, XpRangeComponent],
})
export class PlayerStatPage {
    modalCtrl = inject(ModalController);
    humanManagerService = inject(HumanManagerService);
    statIconDict = statIconDict;

    close() {
        this.modalCtrl.dismiss();
    }
}
