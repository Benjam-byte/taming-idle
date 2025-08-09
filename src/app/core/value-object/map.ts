import { signal } from '@angular/core';

type MapKey = 'tresor' | 'monster' | 'empty';

export class Map {
  content = signal<MapKey | undefined>('empty');

  constructor() {}

  setContent(value: MapKey | undefined) {
    this.content.set(value);
  }
}
