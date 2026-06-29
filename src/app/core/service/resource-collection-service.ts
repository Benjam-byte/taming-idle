import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LootActions } from 'src/app/store/loot/loot.actions';
import { WorldActions } from 'src/app/store/world/world.actions';
import { MapStore } from './map/map.store';

@Injectable({ providedIn: 'root' })
export class ResourceCollectionService {
  private readonly mapService = inject(MapStore);
  private readonly store = inject(Store);

  collectActiveTileResource(): void {
    const tile = this.mapService.activeTile();

    if (!tile?.hasResource) {
      return;
    }

    tile.collectResource();
    this.store.dispatch(LootActions.increment({ key: 'wheat', amount: 1 }));
    this.store.dispatch(
      WorldActions.tileMutated({
        mutation: {
          key: `${tile.coordinate.x}:${tile.coordinate.y}`,
          hasMonster: tile.hasMonster,
          hasResource: false,
        },
      }),
    );
    this.mapService.refresh();
  }

  collectActiveTileMonsterResource(): void {
    const tile = this.mapService.activeTile();

    if (!tile?.hasMonster) {
      return;
    }

    tile.killMonster();
    this.store.dispatch(
      WorldActions.tileMutated({
        mutation: {
          key: `${tile.coordinate.x}:${tile.coordinate.y}`,
          hasMonster: false,
          hasResource: tile.hasResource,
        },
      }),
    );
    this.mapService.refresh();
  }

  collectSoul(): void {
    this.store.dispatch(LootActions.increment({ key: 'soul', amount: 1 }));
  }

  collectGlitchedStone(): void {
    this.store.dispatch(LootActions.increment({ key: 'glitchedStone', amount: 1 }));
  }
}
