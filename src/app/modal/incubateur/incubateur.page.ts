import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EggManagerService } from 'src/app/core/service/monster/egg-manager.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Egg } from 'src/app/database/egg/egg.type';
import { FormatDuration } from '../../core/pipe/formatDuration.pipe';
import { ModalController } from '@ionic/angular/standalone';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { EggIncubationComponent } from './egg-incubation/egg-incubation.component';
import { EggTimerComponent } from './egg-timer/egg-timer.component';
import { CollectEggComponent } from './collect-egg/collect-egg.component';
import { TamedMonsterManagerService } from 'src/app/core/service/monster/tamed-monster-manager.service';

@Component({
    selector: 'app-incubateur',
    templateUrl: './incubateur.page.html',
    styleUrls: ['./incubateur.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormatDuration,
        ModalLayoutComponent,
        EggTimerComponent,
    ],
})
export class IncubateurPage {
    modalCtrl = inject(ModalController);
    eggManagerService = inject(EggManagerService);
    tamedMonsterManager = inject(TamedMonsterManagerService);

    eggList = toSignal(this.eggManagerService.eggList$);
    formattedEggList = computed<(null | Egg)[]>(() => {
        const eggList = this.eggList()?.slice(0, 24);
        if (!eggList) return Array(24).fill(null);
        const eggListMinusIncubed = eggList.filter(
            (egg) => egg.incubateur === null
        );
        return [
            ...eggListMinusIncubed,
            ...Array(24 - eggListMinusIncubed.length).fill(null),
        ];
    });

    incubateurOneContent = computed<Egg | undefined>(() => {
        return this.eggList()?.find((egg) => egg.incubateur?.index === 0);
    });

    async select(egg: Egg) {
        const modal = await this.modalCtrl.create({
            component: EggIncubationComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: false,
            componentProps: {
                egg: egg,
            },
        });

        modal.present();

        const { data } = await modal.onWillDismiss();
        if (data) {
            this.eggManagerService.incubeEgg$(egg).subscribe();
        }
    }

    collect(egg: Egg | undefined) {
        if (!egg) return;
        if (this.isHatched(egg)) {
            this.openCollectModal(egg);
        }
    }

    async openCollectModal(egg: Egg) {
        const modal = await this.modalCtrl.create({
            component: CollectEggComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: false,
            componentProps: {
                name: egg.monsterName,
            },
        });

        modal.present();
        const { data } = await modal.onWillDismiss();
        if (data) {
            this.eggManagerService
                .hatch$(egg, data)
                .subscribe(() => this.modalCtrl.dismiss());
        }
    }

    private isHatched(egg: Egg) {
        if (!egg.incubateur) return false;
        const eggRemain = Math.max(
            0,
            egg.incubateur.startedAt + egg.hatchingTime - Date.now()
        );
        return eggRemain === 0;
    }
}
