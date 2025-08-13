import Monster from 'src/app/core/value-object/monster';

export type CombatTower = {
  id: string;
  level: number;
  boss: Monster;
};
