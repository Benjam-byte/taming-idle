import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { LootActions } from 'src/app/store/loot/loot.actions';
import { WorldActions } from 'src/app/store/world/world.actions';
import { Coordinate } from 'src/app/core/type/coordinate';
import { MapStore } from './map/map.store';

@Injectable({ providedIn: 'root' })
export class ResourceCollectionService {
  private readonly mapService = inject(MapStore);
  private readonly store = inject(Store);

  collectTileResourceAt(coord: Coordinate): void {
    const tile = this.mapService.getTileAt(coord);
    if (!tile?.hasResource) return;

    this.store.dispatch(LootActions.increment({ key: 'wheat', amount: 1 }));
    this.store.dispatch(
      WorldActions.tileMutated({
        mutation: { key: `${coord.x}:${coord.y}`, hasMonster: tile.hasMonster, hasResource: false },
      }),
    );
    this.mapService.mutateTile(coord, { hasResource: false });
  }

  collectActiveTileMonsterResource(): void {
    const tile = this.mapService.activeTile();
    if (!tile?.hasMonster) return;

    const coord = tile.coordinate;
    this.store.dispatch(
      WorldActions.tileMutated({
        mutation: { key: `${coord.x}:${coord.y}`, hasMonster: false, hasResource: tile.hasResource },
      }),
    );
    this.mapService.mutateTile(coord, { hasMonster: false });
  }

  collectSoul(): void {
    this.store.dispatch(LootActions.increment({ key: 'soul', amount: 1 }));
  }

  collectGlitchedStone(): void {
    this.store.dispatch(LootActions.increment({ key: 'glitchedStone', amount: 1 }));
  }
}
