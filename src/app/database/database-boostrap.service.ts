import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MapStore } from '../core/service/map/map.store';
import { MonsterStore } from '../core/service/monster/monster.store';
import { SaveGameRepository } from './save-game.repository';
import { LootActions } from '../store/loot/loot.actions';
import { WorldActions } from '../store/world/world.actions';
import { MonsterActions } from '../store/monster/monster.actions';

@Injectable({ providedIn: 'root' })
export class DatabaseBootstrapService {
  private readonly repo = inject(SaveGameRepository);
  private readonly store = inject(Store);
  private readonly mapService = inject(MapStore);
  private readonly monsterStore = inject(MonsterStore);

  async ensureInitialized(): Promise<void> {
    try {
      const save = await this.repo.load();

      this.store.dispatch(LootActions.hydrate({ loot: save.loot }));
      this.store.dispatch(WorldActions.hydrate({ world: save.world }));
      this.store.dispatch(MonsterActions.hydrate({ monster: save.monster }));
      this.mapService.hydrate(save.world);
      this.monsterStore.hydrate(save.monster);
    } catch (err) {
      console.error('[DatabaseBootstrap] failed', err);
    }
  }
}
