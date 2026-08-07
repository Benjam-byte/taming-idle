import { ElementType } from '../models/common';
import { MonsterName } from '../models/monster';

export const MONSTER_PORTRAIT: Record<MonsterName, string> = {
  'Terra larva': 'assets/monster/terra_larva/Terra_larva.webp',
  Slime: 'assets/monster/slime/Slime_Base.webp',
};

export const MONSTER_TYPE_ICON: Record<ElementType, string> = {
  neutre: 'assets/icon/earth.png',
  feu: 'assets/icon/earth.png',
};
