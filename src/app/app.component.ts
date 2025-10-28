import { Component, inject } from '@angular/core';
import {
    IonApp,
    IonRouterOutlet,
    ModalController,
} from '@ionic/angular/standalone';
import { DebugService } from './core/service/debug.service';
import { OfflineProgress } from './core/service/offline-progress';
import { OfflineProgressPanelComponent } from './core/components/offline-progress-panel/offline-progress-panel.component';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    debugService = inject(DebugService);
    offileProgressService = inject(OfflineProgress);
    modalCtrl = inject(ModalController);

    constructor() {
        this.openOfflineProgressModal();

        setInterval(() => this.offileProgressService.saveSnapshot(), 15_000);
    }

    async openOfflineProgressModal() {
        const modal = await this.modalCtrl.create({
            component: OfflineProgressPanelComponent,
            cssClass: 'fit-modal',
            backdropDismiss: false,
            showBackdrop: true,
        });

        modal.present();
        const { data } = await modal.onWillDismiss();
        if (data) {
            this.offileProgressService.addFromSnapShot$(data).subscribe();
        }
    }
}
