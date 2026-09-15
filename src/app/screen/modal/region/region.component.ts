import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MONSTER_PORTRAIT } from 'src/app/core/assets/monster-portraits';
import {
  selectCurrentRegionName,
  selectRegions,
} from 'src/app/store/world/world.reducer';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

type RegionStatEntry = {
  label: string;
  value: number;
};

@Component({
  selector: 'app-region-modal',
  standalone: true,
  imports: [ModalLayoutComponent],
  templateUrl: './region.component.html',
  styleUrl: './region.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionModalComponent {
  private readonly store = inject(Store);
  private readonly regions = this.store.selectSignal(selectRegions);

  readonly currentRegionName = this.store.selectSignal(selectCurrentRegionName);
  readonly region = computed(() => this.regions()[this.currentRegionName()]);

  readonly stats = computed<RegionStatEntry[]>(() => {
    const region = this.region();

    return [
      { label: 'Densité de monstres', value: region.monsterDensity },
      { label: 'Mana par monstre', value: region.monsterManaDrop },
      { label: "Taux de drop d'âmes", value: region.soulDropRate },
      { label: 'Densité de nourriture', value: region.foodDensity },
      { label: 'Taux de drop de nourriture', value: region.foodDropRate },
      { label: 'Quantité de minerai', value: region.oreAmount },
      { label: 'Taux de ressource shiny', value: region.shinyResourceRate },
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
}
