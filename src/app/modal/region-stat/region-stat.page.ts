import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { RegionManagerService } from 'src/app/core/service/location/region.service';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { statIconDict } from 'src/app/core/config/statIconDict';
import { CombatTowerManagerService } from 'src/app/core/service/location/combat-tower.service';
import { RoundToPipe } from '../../core/pipe/roundTo.pipe';

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
    regionService = inject(RegionManagerService);
    combatTowerManagerService = inject(CombatTowerManagerService);
    statIconDict = statIconDict;

    close() {
        this.modalCtrl.dismiss();
    }
}
