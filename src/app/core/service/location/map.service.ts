import { inject, Injectable, signal } from '@angular/core';
import { Map } from '../../value-object/map';
import { RegionService } from './region.service';

type MapKey = 'tresor' | 'monster' | 'empty';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  regionService = inject(RegionService);
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
      this.regionService.getSelectedRegionMapDict()
    )) {
      cumulative += prob;
      if (rand < cumulative) {
        return key as MapKey;
      }
    }

    return 'empty';
  }
}
