import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CombatService {
  isCombat = signal(false);

  startCombat(): void {
    this.isCombat.update(() => true);
  }

  endCombat(): void {
    this.isCombat.update(() => false);
  }
}
