import Monster from './monster';

type Encounter = {
  createBoss: () => Monster;
  duration: number;
};

const levelDict: Record<number, Encounter> = {
  1: { createBoss: () => new Monster(5, 'slime'), duration: 10000 },
  2: { createBoss: () => new Monster(10, 'slime'), duration: 10000 },
  3: { createBoss: () => new Monster(15, 'slime'), duration: 10000 },
  4: { createBoss: () => new Monster(20, 'slime'), duration: 10000 },
  5: { createBoss: () => new Monster(30, 'slime'), duration: 10000 },
};

export class CombatTower {
  boss: Monster;
  level: number;

  constructor() {
    this.level = 1;
    this.boss = levelDict[this.level].createBoss();
  }

  retry() {
    this.boss = levelDict[this.level].createBoss();
  }

  levelUp() {
    this.level++;
    this.boss = levelDict[this.level].createBoss();
  }
}
