import { Injectable, inject } from '@angular/core';
import { SaveGameRepository } from './save-game.repository';
import { LootStore } from './store/loot.store';
import { EntityStore } from './type/entity-store';

@Injectable({ providedIn: 'root' })
export class DatabaseBootstrapService {
  private readonly repo = inject(SaveGameRepository);

  private readonly lootStore = inject(LootStore);

  private get stores(): EntityStore[] {
    return [
      this.lootStore,
      // future:
      // this.humanStore,
      // this.worldStore,
      // this.monsterStore,
    ];
  }

  async ensureInitialized(): Promise<void> {
    try {
      const save = await this.repo.load();

      for (const store of this.stores) {
        store.hydrate(save);
      }
    } catch (err) {
      console.error('[DatabaseBootstrap] failed', err);
    }
  }
}
