import { Loot } from './type/loot';

export type SaveGame = {
  version: number;
  loot: Loot;
  updatedAt: string;
};
