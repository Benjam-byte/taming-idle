export type CombatTower = {
  id: string;
  level: number;
  boss: { life: number; type: 'slime'; duration: number };
};
