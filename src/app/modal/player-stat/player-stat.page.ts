import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
import { statIconDict, StatKey } from 'src/app/core/config/statIconDict';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { RelicManagerService } from 'src/app/core/service/player/relic-manager.service';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { RoundToPipe } from '../../core/pipe/roundTo.pipe';
import { RelicSelectionComponent } from 'src/app/core/components/relic-selection/relic-selection.component';
import { Human } from 'src/app/database/human/human.type';
import { RenameModalComponent } from 'src/app/core/components/rename-modal/rename-modal.component';

@Component({
    selector: 'app-player-stat',
    templateUrl: './player-stat.page.html',
    styleUrls: ['./player-stat.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        XpRangeComponent,
        ModalLayoutComponent,
        RoundToPipe,
    ],
})
export class PlayerStatPage {
    modalCtrl = inject(ModalController);
    humanManagerService = inject(HumanManagerService);
    relicManagerService = inject(RelicManagerService);
    statIconDict = statIconDict;

    relic = toSignal(this.humanManagerService.relic$);

    relicBonusImagePath = computed(() => {
        const stat = this.relic()?.effet.stat as StatKey;
        if (!stat) return this.statIconDict['lootNormalBonus'];
        return this.statIconDict[stat];
    });

    async select() {
        const relicList = this.relicManagerService.relicList.filter(
            (relic) => relic.quantity > 0
        );
        const modal = await this.modalCtrl.create({
            component: RelicSelectionComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: false,
            componentProps: {
                relicList: relicList,
            },
        });

        modal.present();

        const { data } = await modal.onWillDismiss();
        if (data) {
            this.humanManagerService.associateRelic$(data.id).subscribe();
        }
    }

    dissociate() {
        this.humanManagerService.associateRelic$('').subscribe();
    }

    getHumanLevel(human: Human | null) {
        if (!human) return 0;
        return human.availableProfession.reduce(
            (acc, profession) => acc + profession.level,
            0
        );
    }

    async openRenameModal() {
        const modal = await this.modalCtrl.create({
            component: RenameModalComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: true,
            componentProps: {
                oldName: this.humanManagerService.human.pseudo,
            },
        });

        modal.present();

        const { data } = await modal.onWillDismiss();
        if (data) {
            this.humanManagerService.updatePseudo$(data).subscribe();
        }
    }
}
