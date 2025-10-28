import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
    OfflineProgress,
    OfflineSnapshot,
} from '../../service/offline-progress';
import { RoundToPipe } from '../../pipe/roundTo.pipe';
import { formatElapsed } from '../../helpers/time-format';
import { ModalController } from '@ionic/angular/standalone';
import { ProfessionName } from '../../enum/profession-name.enum';

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
              xpObject: Record<ProfessionName, number>;
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

    professionList = computed(() => {
        const restored = this.restored();
        if (!restored) return;
        return this.getActiveProfessions(restored.xpObject);
    });

    isProfessionList = computed(() => {
        const restored = this.restored();
        if (!restored) return;
        return this.getActiveProfessions(restored.xpObject).length > 0;
    });

    ngOnInit(): void {
        const restored = this.offlineProgressService.restoreFromSnapshot();
        if (restored) this.restored.set(restored);
    }

    collect() {
        this.modalCtrl.dismiss(this.restored());
    }

    private getActiveProfessions(
        xpObject: Record<ProfessionName, number>
    ): Array<{ name: ProfessionName; value: number }> {
        return Object.entries(xpObject)
            .filter(([, value]) => value > 0)
            .map(([name, value]) => ({
                name: name as ProfessionName,
                value,
            }));
    }
}
