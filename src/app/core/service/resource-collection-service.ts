import { Injectable, inject } from '@angular/core';
import { LootStore } from 'src/app/database/store/loot.store';
import { MapService } from './map/map-service';

@Injectable({ providedIn: 'root' })
export class ResourceCollectionService {
  private readonly mapService = inject(MapService);
  private readonly lootStore = inject(LootStore);

  async collectActiveTileResource(): Promise<void> {
    const tile = this.mapService.activeTile();

    if (!tile?.hasResource) {
      return;
    }

    tile.collectResource();
    await this.lootStore.incr('wheat', 1);
    this.mapService.refresh();
  }

  async collectActiveTileMonsterResource(): Promise<void> {
    const tile = this.mapService.activeTile();
    if (!tile?.hasMonster) {
      return;
    }
    tile.killMonster();
    this.mapService.refresh();
  }

  async collectSoul() {
    await this.lootStore.incr('soul', 1);
  }

  async collectGlitchedStone() {
    await this.lootStore.incr('glitchedStone', 1);
  }
}
