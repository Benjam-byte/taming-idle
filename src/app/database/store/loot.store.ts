import { Injectable, computed, inject, signal } from '@angular/core';
import { DEFAULT_LOOT } from '../default-value/loot';
import { SaveGameRepository } from '../save-game.repository';
import { SaveGame } from '../save-game.type';
import { EntityStore } from '../type/entity-store';
import { Loot } from '../type/loot';

@Injectable({ providedIn: 'root' })
export class LootStore implements EntityStore {
  private readonly repo = inject(SaveGameRepository);

  private readonly _loot = signal<Loot>({ ...DEFAULT_LOOT });

  readonly loot = computed(() => this._loot());

  readonly wheat = computed(() => this._loot().wheat);
  readonly enchantedwheat = computed(() => this._loot().enchantedwheat);
  readonly soul = computed(() => this._loot().soul);
  readonly enchantedSoul = computed(() => this._loot().enchantedSoul);
  readonly openedChest = computed(() => this._loot().openedChest);
  readonly glitchedStone = computed(() => this._loot().glitchedStone);

  hydrate(save: SaveGame): void {
    this._loot.set({
      ...DEFAULT_LOOT,
      ...save.loot,
    });
  }

  async update(patch: Partial<Loot>): Promise<void> {
    const next: Loot = {
      ...this._loot(),
      ...patch,
    };

    this._loot.set(next);

    await this.repo.patch({
      loot: next,
    });
  }

  async incr(key: keyof Loot, amount = 1): Promise<void> {
    const current = this._loot();

    await this.update({
      [key]: current[key] + amount,
    } as Partial<Loot>);
  }

  async reset(): Promise<void> {
    await this.update({ ...DEFAULT_LOOT });
  }
}
