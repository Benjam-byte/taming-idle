import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelicManagerService } from 'src/app/core/service/player/relic-manager.service';
import { Relics } from 'src/app/database/relics/relics.type';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

@Component({
    selector: 'app-relic-list',
    templateUrl: './relic-list.page.html',
    styleUrls: ['./relic-list.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ModalLayoutComponent],
})
export class RelicListPage {
    relicManagerService = inject(RelicManagerService);

    readonly selectedId = signal<string | undefined>(undefined);

    select(relic: Relics) {
        if (relic.id === this.selectedId()) {
            this.selectedId.set(undefined);
            return;
        }
        this.selectedId.set(relic.id);
    }

    groupRelicsByStat(relics: Relics[]): Map<string, Relics[]> {
        return relics.reduce((acc, relic) => {
            const key = relic.effet.stat;
            const list = acc.get(key) ?? [];
            list.push(relic);
            acc.set(key, list);
            return acc;
        }, new Map<string, Relics[]>());
    }

    groupRelicsByRank(relics: Relics[]): Map<string, Relics[]> {
        return relics.reduce((acc, relic) => {
            const key = 'rank' + relic.rank;
            const list = acc.get(key) ?? [];
            list.push(relic);
            acc.set(key, list);
            return acc;
        }, new Map<string, Relics[]>());
    }

    getSelectedRelic(relicList: Relics[]) {
        return relicList.find((relic) => relic.id === this.selectedId());
    }
}
