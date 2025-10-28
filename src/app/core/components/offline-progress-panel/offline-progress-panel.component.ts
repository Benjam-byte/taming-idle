import {
    Component,
    computed,
    inject,
    input,
    OnInit,
    signal,
    Signal,
} from '@angular/core';
import {
    OfflineProgress,
    OfflineSnapshot,
} from '../../service/offline-progress';
import { RoundToPipe } from '../../pipe/roundTo.pipe';
import { formatElapsed } from '../../helpers/time-format';

@Component({
    selector: 'app-offline-progress-panel',
    templateUrl: './offline-progress-panel.component.html',
    styleUrls: ['./offline-progress-panel.component.scss'],
    imports: [RoundToPipe],
})
export class OfflineProgressPanelComponent implements OnInit {
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

    ngOnInit(): void {
        const restored = this.offlineProgressService.restoreFromSnapshot();
        if (restored) this.restored.set(restored);
    }

    ellaspedTime = computed(() => {
        const restored = this.restored();
        if (!restored) return;
        return `⏱ Temps écoulé : ${formatElapsed(
            Date.now() - restored.snapshot.savedAt
        )}`;
    });
    constructor() {}
}
