import { inject, Injectable, signal } from '@angular/core';
import { Map } from '../../value-object/map';
import { RegionManagerService } from './region-manager.service';

type MapKey = 'tresor' | 'monster' | 'empty';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  regionManagerService = inject(RegionManagerService);
  map = signal<Map>(new Map());

  constructor() {}

  changeMap() {
    this.map().setContent(undefined);
    const map = this.getRandomMap();
    setTimeout(() => {
      this.map().setContent(map);
    }, 100);
  }

  private getRandomMap(): MapKey {
    const rand = Math.random();
    let cumulative = 0;

    for (const [key, prob] of Object.entries(
      this.regionManagerService.currentRegion().getMapDict()
    )) {
      cumulative += prob;
      if (rand < cumulative) {
        return key as MapKey;
      }
    }

    return 'empty';
  }
}
