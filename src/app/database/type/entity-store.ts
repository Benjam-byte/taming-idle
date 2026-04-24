import { SaveGame } from '../save-game.type';

export interface EntityStore {
  hydrate(save: SaveGame): void;
}
