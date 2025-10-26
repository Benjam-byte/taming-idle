import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { RegionManagerService } from 'src/app/core/service/location/region.service';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { statIconDict } from 'src/app/core/config/statIconDict';
import { CombatTowerManagerService } from 'src/app/core/service/location/combat-tower.service';
import { RoundToPipe } from '../../core/pipe/roundTo.pipe';
import { AssignedMonsterManagerService } from 'src/app/core/service/player/assigned-monster-manager.service';
import { TamedMonsterManagerService } from 'src/app/core/service/monster/tamed-monster-manager.service';
import { ActifMonsterSelectionComponent } from './actif-monster-selection/actif-monster-selection.component';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
@Component({
    selector: 'app-region-stat',
    templateUrl: './region-stat.page.html',
    styleUrls: ['./region-stat.page.scss'],
    standalone: true,
    imports: [
        CommonModule,
        XpRangeComponent,
        ModalLayoutComponent,
        RoundToPipe,
    ],
})
export class RegionStatPage {
    modalCtrl = inject(ModalController);
    regionManager = inject(RegionManagerService);
    combatTowerManager = inject(CombatTowerManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    tamedMonsterManager = inject(TamedMonsterManagerService);
    humanManager = inject(HumanManagerService);
    statIconDict = statIconDict;

    close() {
        this.modalCtrl.dismiss();
    }

    async swapActifMonster() {
        const tamedMonsterList =
            this.tamedMonsterManager.tamedMonsterList.concat(
                this.humanManager.humanInTamedMonsterFormat
            );
        const modal = await this.modalCtrl.create({
            component: ActifMonsterSelectionComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: false,
            componentProps: {
                tamedMonsterList: tamedMonsterList,
            },
        });

        modal.present();

        const { data } = await modal.onWillDismiss();
        if (data) {
            this.regionManager
                .updateSelectedRegionAssignedMonster$(data)
                .subscribe();
        }
    }
}
