import { DEFAULT_LOOT } from './default-value/loot';
import { DEFAULT_WORLD } from './default-value/world';
import { SaveGame } from './save-game.type';

export const DB_VERSION = 1;
export const SAVE_KEY = 'save_game';

export function createDefaultSaveGame(): SaveGame {
  return {
    version: DB_VERSION,
    loot: { ...DEFAULT_LOOT },
    world: { ...DEFAULT_WORLD },
    updatedAt: new Date().toISOString(),
  };
}
