import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import { MONSTER_PORTRAIT } from 'src/app/core/assets/monster-portraits';
import { FloatingTitleComponent } from 'src/app/components/floating-title/floating-title.component';
import {
  selectCurrentRegionName,
  selectRegions,
} from 'src/app/store/world/world.reducer';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

type RegionStatEntry = {
  label: string;
  value: number;
  iconSrc: string;
};

@Component({
  selector: 'app-region-modal',
  standalone: true,
  imports: [ModalLayoutComponent, FloatingTitleComponent],
  templateUrl: './region.component.html',
  styleUrl: './region.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionModalComponent {
  private readonly store = inject(Store);
  private readonly modalCtrl = inject(ModalController);
  private readonly regions = this.store.selectSignal(selectRegions);

  readonly currentRegionName = this.store.selectSignal(selectCurrentRegionName);
  readonly region = computed(() => this.regions()[this.currentRegionName()]);

  readonly stats = computed<RegionStatEntry[]>(() => {
    const region = this.region();

    return [
      {
        label: 'Densité de monstres',
        value: region.monsterDensity,
        iconSrc: 'assets/icon/stat/monster.png',
      },
      {
        label: 'Mana par monstre',
        value: region.monsterManaDrop,
        iconSrc: 'assets/icon/stat/enchantedgathering.png',
      },
      {
        label: "Taux de drop d'âmes",
        value: region.soulDropRate,
        iconSrc: 'assets/icon/stat/soul.png',
      },
      {
        label: 'Densité de nourriture',
        value: region.foodDensity,
        iconSrc: 'assets/icon/stat/forest.png',
      },
      {
        label: 'Taux de drop de nourriture',
        value: region.foodDropRate,
        iconSrc: 'assets/icon/stat/gathering.png',
      },
      {
        label: 'Quantité de minerai',
        value: region.oreAmount,
        iconSrc: 'assets/icon/gems.png',
      },
      {
        label: 'Taux de ressource shiny',
        value: region.shinyResourceRate,
        iconSrc: 'assets/icon/stat/luck.png',
      },
    ];
  });

  readonly unlockedMonsters = computed(() =>
    this.region().unlockedMonsters.map((name) => ({
      name,
      portraitSrc: MONSTER_PORTRAIT[name],
    })),
  );

  trackStat(index: number, stat: RegionStatEntry): string {
    return stat.label;
  }

  close(): Promise<boolean> {
    return this.modalCtrl.dismiss();
  }
}
