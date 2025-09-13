import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { RelicService } from 'src/app/core/service/player/relic-manager.service';
import { Relics } from 'src/app/database/relics/relics.type';

@Component({
  selector: 'app-relic-list',
  templateUrl: './relic-list.page.html',
  styleUrls: ['./relic-list.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule],
})
export class RelicListPage {
  modalCtrl = inject(ModalController);
  relicManagerService = inject(RelicService);

  readonly selectedId = signal<string | undefined>(undefined);

  close() {
    this.modalCtrl.dismiss();
  }

  select(newId: string) {
    if (newId === this.selectedId()) {
      this.selectedId.set(undefined);
      return;
    }
    this.selectedId.set(newId);
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
}
