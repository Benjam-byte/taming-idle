import { Component, inject } from '@angular/core';
import {
    IonApp,
    IonRouterOutlet,
    ModalController,
} from '@ionic/angular/standalone';
import { DebugService } from './core/service/debug.service';
import {
    OfflineProgress,
    OfflineSnapshot,
} from './core/service/offline-progress';
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
        const restored = this.offileProgressService.restoreFromSnapshot();
        if (restored) {
            this.openOfflineProgressModal(restored);
        }
        setInterval(() => this.offileProgressService.saveSnapshot(), 15_000);
    }

    async openOfflineProgressModal(restored: {
        wheat: number;
        enchantedWheat: number;
        soul: number;
        enchantedSoul: number;
        snapshot: OfflineSnapshot;
    }) {
        const modal = await this.modalCtrl.create({
            component: OfflineProgressPanelComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
