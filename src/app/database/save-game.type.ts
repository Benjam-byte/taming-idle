import { Loot } from './type/loot';
import { WorldSave } from './type/world';

export type SaveGame = {
  version: number;
  loot: Loot;
  world: WorldSave;
  updatedAt: string;
};
