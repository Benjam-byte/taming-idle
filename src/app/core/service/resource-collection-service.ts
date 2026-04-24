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
    await this.lootStore.incr('wheatQuantity', 1);
    this.mapService.refresh();
  }
}
