import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DatabaseService } from './database.service';
import { SaveGame } from './save-game.type';
import { SAVE_KEY, createDefaultSaveGame, DB_VERSION } from './default-save';

@Injectable({ providedIn: 'root' })
export class SaveGameRepository {
  private readonly db = inject(DatabaseService);

  private save: SaveGame | null = null;

  async load(): Promise<SaveGame> {
    const stored = await firstValueFrom(this.db.get<SaveGame>(SAVE_KEY));

    const save = stored ? this.migrate(stored) : createDefaultSaveGame();

    this.save = save;
    await this.persist();

    return save;
  }

  getSnapshot(): SaveGame {
    if (!this.save) {
      throw new Error('SaveGameRepository not initialized');
    }

    return this.save;
  }

  async patch(patch: Partial<SaveGame>): Promise<SaveGame> {
    const current = this.getSnapshot();

    this.save = {
      ...current,
      ...patch,
      version: DB_VERSION,
      updatedAt: new Date().toISOString(),
    };

    await this.persist();

    return this.save;
  }

  async reset(): Promise<SaveGame> {
    this.save = createDefaultSaveGame();
    await this.persist();
    return this.save;
  }

  private async persist(): Promise<void> {
    await firstValueFrom(this.db.set(SAVE_KEY, this.getSnapshot()));
  }

  private migrate(save: SaveGame): SaveGame {
    let migrated: SaveGame = {
      ...createDefaultSaveGame(),
      ...save,
      loot: {
        ...createDefaultSaveGame().loot,
        ...(save.loot ?? {}),
      },
    };

    if (!migrated.version) {
      migrated.version = 1;
    }

    // Exemple futur :
    // if (migrated.version === 1) {
    //   migrated = migrateFrom1To2(migrated);
    // }

    migrated.version = DB_VERSION;

    return migrated;
  }
}
