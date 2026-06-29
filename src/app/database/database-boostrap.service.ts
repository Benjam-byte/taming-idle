import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MapService } from '../core/service/map/map-service';
import { SaveGameRepository } from './save-game.repository';
import { LootActions } from '../store/loot/loot.actions';
import { WorldActions } from '../store/world/world.actions';

@Injectable({ providedIn: 'root' })
export class DatabaseBootstrapService {
  private readonly repo = inject(SaveGameRepository);
  private readonly store = inject(Store);
  private readonly mapService = inject(MapService);

  async ensureInitialized(): Promise<void> {
    try {
      const save = await this.repo.load();

      this.store.dispatch(LootActions.hydrate({ loot: save.loot }));
      this.store.dispatch(WorldActions.hydrate({ world: save.world }));
      this.mapService.hydrate(save.world);
    } catch (err) {
      console.error('[DatabaseBootstrap] failed', err);
    }
  }
}
