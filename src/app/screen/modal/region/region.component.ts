import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { Store } from '@ngrx/store';
import { MONSTER_PORTRAIT } from 'src/app/core/assets/monster-portraits';
import {
  selectCurrentRegionName,
  selectRegions,
} from 'src/app/store/world/world.reducer';
import { Header } from 'src/app/components/header/header.component';

type RegionStatEntry = {
  label: string;
  value: number;
  max: number;
  color: string;
};

@Component({
  selector: 'app-region-modal',
  standalone: true,
  imports: [Header],
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

  readonly regionLevel = computed(
    () =>
      this.region().monsterDensity +
      this.region().monsterManaDrop +
      this.region().soulDropRate +
      this.region().foodDensity +
      this.region().foodDropRate +
      this.region().oreAmount +
      this.region().shinyResourceRate,
  );

  readonly stats = computed<RegionStatEntry[]>(() => {
    const region = this.region();

    return [
      {
        label: 'Densité de monstres',
        value: region.monsterDensity,
        color: 'bg-mana',
        max: 10,
      },
      {
        label: 'Mana par monstre',
        value: region.monsterManaDrop,
        color: 'bg-mana',
        max: 10,
      },
      {
        label: "Taux de drop d'âmes",
        value: region.soulDropRate,
        color: 'bg-mana',
        max: 10,
      },
      {
        label: 'Densité de nourriture',
        value: region.foodDensity,
        color: 'bg-nature',
        max: 10,
      },
      {
        label: 'Taux de drop de nourriture',
        value: region.foodDropRate,
        color: 'bg-nature',
        max: 10,
      },
      {
        label: 'Quantité de minerai',
        value: region.oreAmount,
        color: 'bg-nature',
        max: 10,
      },
      {
        label: 'Taux de ressource shiny',
        value: region.shinyResourceRate,
        color: 'bg-nature',
        max: 10,
      },
    ];
  });

  trackStat(_index: number, stat: RegionStatEntry): string {
    return stat.label;
  }

  closeModal(): Promise<boolean> {
    return this.modalCtrl.dismiss();
  }
}
