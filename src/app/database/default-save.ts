import { DEFAULT_LOOT } from './default-value/loot';
import { SaveGame } from './save-game.type';

export const DB_VERSION = 1;
export const SAVE_KEY = 'save_game';

export const DEFAULT_SAVE: SaveGame = {
  version: 1,
  loot: DEFAULT_LOOT,
  updatedAt: new Date().toISOString(),
};

export function createDefaultSaveGame(): SaveGame {
  return {
    version: DB_VERSION,
    loot: { ...DEFAULT_LOOT },
    updatedAt: new Date().toISOString(),
  };
}
