import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class LootManagerService {
  wheat: number;

  constructor() {
    this.wheat = 0;
  }

  addWheat(value: number) {
    this.wheat += value;
  }
}
