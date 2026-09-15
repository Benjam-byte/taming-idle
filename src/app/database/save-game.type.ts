import { Loot } from './type/loot';
import { MonsterSave } from './type/monster';
import { WorldSave } from './type/world';

export type SaveGame = {
  version: number;
  loot: Loot;
  world: WorldSave;
  monster: MonsterSave;
  updatedAt: string;
};
