import { Region } from '../region/region';

export const DEFAULT_PLAINE: Region = {
  imageSrc: 'assets/map/plaine/Plaine_1.webp',
  description:
    'Une vaste plaine traversée par de petits ruisseaux. Son sol fertile attire de nombreux monstres et concentre des ressources naturelles variées.',
  monsterDensity: 1,
  monsterManaDrop: 1,
  soulDropRate: 1,
  foodDensity: 1,
  foodDropRate: 1,
  oreAmount: 1,
  unlockedMonsters: ['Slime'],
  shinyResourceRate: 0,
};
