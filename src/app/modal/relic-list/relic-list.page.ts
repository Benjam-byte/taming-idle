import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { RelicManagerService } from 'src/app/core/service/player/relic-manager.service';
import { Relics } from 'src/app/database/relics/relics.type';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';

@Component({
  selector: 'app-relic-list',
  templateUrl: './relic-list.page.html',
  styleUrls: ['./relic-list.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class RelicListPage {
  modalCtrl = inject(ModalController);
  relicManagerService = inject(RelicManagerService);
  humanManagerService = inject(HumanManagerService);

  readonly selectedId = signal<string | undefined>(undefined);

  close() {
    this.modalCtrl.dismiss();
  }

  select(relic: Relics) {
    if (relic.quantity === 0) return;
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

  getSelectedRelic(relicList: Relics[]) {
    return relicList.find((relic) => relic.id === this.selectedId());
  }

  use(relic: Relics) {
    this.humanManagerService.useOneRelic(relic.name);
  }

  isUsed(relic: Relics) {
    return relic.entityId !== null;
  }
}
