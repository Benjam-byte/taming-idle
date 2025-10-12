import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { EggManagerService } from 'src/app/core/service/monster/egg-manager.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Egg } from 'src/app/database/egg/egg.type';
import { FormatDuration } from '../../core/pipe/formatDuration.pipe';

@Component({
    selector: 'app-incubateur',
    templateUrl: './incubateur.page.html',
    styleUrls: ['./incubateur.page.scss'],
    standalone: true,
    imports: [IonContent, CommonModule, FormatDuration],
})
export class IncubateurPage {
    modalCtrl = inject(ModalController);
    eggManagerService = inject(EggManagerService);

    eggList = toSignal(this.eggManagerService.eggList$);
    formattedEggList = computed<(null | Egg)[]>(() => {
        const eggList = this.eggList();
        if (!eggList) return Array(24).fill(null);
        return [...eggList, ...Array(24 - eggList.length).fill(null)];
    });

    close() {
        console.log(this.eggList());
        this.modalCtrl.dismiss();
    }
}
