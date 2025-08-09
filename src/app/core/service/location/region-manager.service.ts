import { Injectable, signal } from '@angular/core';
import { Region } from '../../value-object/region';

type availableRegion =
  | 'plaine'
  | 'volcan'
  | 'fight tower'
  | 'bermude'
  | 'wind moutain'
  | 'forest';

@Injectable({
  providedIn: 'root',
})
export class RegionManagerService {
  currentRegion = signal<Region>(new Region('plaine'));
  regionList: availableRegion[] = [
    'plaine',
    'volcan',
    'fight tower',
    'bermude',
    'wind moutain',
    'forest',
  ];
  availableRegionList: availableRegion[] = ['plaine'];
  instanciedRegionList: Region[] = [];

  constructor() {
    this.initRegion();
  }

  initRegion() {
    this.availableRegionList.forEach((regionName) =>
      this.instanciedRegionList.push(new Region(regionName))
    );
    this.currentRegion.set(this.instanciedRegionList[0]);
  }
}
