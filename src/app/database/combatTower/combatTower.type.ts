export type CombatTower = {
    id: string;
    level: number;
    boss: { life: number; type: 'slime' | 'duck'; duration: number };
};
