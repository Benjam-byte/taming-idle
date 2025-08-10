import { inject, Injectable } from '@angular/core';
import { RegionManagerService } from '../location/region-manager.service';
@Injectable({ providedIn: 'root' })
export class LootManagerService {
  regionManagerService = inject(RegionManagerService);
  wheatQuantity: number;

  constructor() {
    this.wheatQuantity = 0;
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

  addWheat(value: number) {
    this.wheatQuantity += value;
  }
}
