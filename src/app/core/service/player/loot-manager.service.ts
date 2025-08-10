import { effect, inject, Injectable, signal } from '@angular/core';
import { RegionManagerService } from '../location/region-manager.service';
import { ProfessionManagerService } from './profession-manager.service';
@Injectable({ providedIn: 'root' })
export class LootManagerService {
  regionManagerService = inject(RegionManagerService);
  professionManagerService = inject(ProfessionManagerService);

  wheatQuantity = signal<number>(0);

  constructor() {
    const savedLevel = localStorage.getItem('wheatQuantity');
    if (savedLevel !== null) {
      this.wheatQuantity.set(Number(savedLevel));
    }

    effect(() => {
      localStorage.setItem('wheatQuantity', String(this.wheatQuantity()));
    });
  }

  getLootValue() {
    const r = Math.random();

    if (r < 0.5) {
      return 1;
    } else if (r < 0.75) {
      return 2;
    } else {
      return 3;
    }
  }

  addWheat(wheat: number) {
    this.wheatQuantity.update((value) => value + wheat);
    this.professionManagerService.updateFermier();
  }
}
