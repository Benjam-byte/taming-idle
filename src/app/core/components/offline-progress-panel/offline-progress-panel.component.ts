import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
    OfflineProgress,
    OfflineSnapshot,
} from '../../service/offline-progress';
import { RoundToPipe } from '../../pipe/roundTo.pipe';
import { formatElapsed } from '../../helpers/time-format';
import { ModalController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-offline-progress-panel',
    templateUrl: './offline-progress-panel.component.html',
    styleUrls: ['./offline-progress-panel.component.scss'],
    imports: [RoundToPipe],
})
export class OfflineProgressPanelComponent implements OnInit {
    modalCtrl = inject(ModalController);
    offlineProgressService = inject(OfflineProgress);
    restored = signal<
        | {
              wheat: number;
              enchantedWheat: number;
              soul: number;
              enchantedSoul: number;
              snapshot: OfflineSnapshot;
          }
        | undefined
    >(undefined);

    message = computed(
        () =>
            `Votre ${
                this.restored()?.snapshot.assignedMonster.monsterSpecies
            } a récolté pour vous !`
    );

    ellaspedTime = computed(() => {
        const restored = this.restored();
        if (!restored) return;
        return `⏱ Temps écoulé : ${formatElapsed(
            Date.now() - restored.snapshot.savedAt
        )}`;
    });

    ngOnInit(): void {
        const restored = this.offlineProgressService.restoreFromSnapshot();
        if (restored) this.restored.set(restored);
    }

    collect() {
        this.modalCtrl.dismiss(this.restored());
    }
}
