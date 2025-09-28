import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { RegionManagerService } from 'src/app/core/service/location/region.service';

@Component({
    selector: 'app-region-stat',
    templateUrl: './region-stat.page.html',
    styleUrls: ['./region-stat.page.scss'],
    standalone: true,
    imports: [IonContent, CommonModule],
})
export class RegionStatPage {
    modalCtrl = inject(ModalController);
    regionService = inject(RegionManagerService);

    close() {
        this.modalCtrl.dismiss();
    }
}
