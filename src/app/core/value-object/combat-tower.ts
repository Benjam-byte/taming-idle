import Monster from './monster';

type Encounter = {
  boss: Monster;
  duration: number;
};

const levelDict: Record<number, Encounter> = {
  1: { boss: new Monster(5, 'slime'), duration: 10000 },
  2: { boss: new Monster(10, 'slime'), duration: 10000 },
  3: { boss: new Monster(15, 'slime'), duration: 10000 },
  4: { boss: new Monster(20, 'slime'), duration: 10000 },
  5: { boss: new Monster(30, 'slime'), duration: 10000 },
};

export class CombatTower {
  boss: Monster;
  level: number;

  constructor() {
    this.level = 1;
    this.boss = levelDict[this.level].boss;
  }

  levelUp() {
    this.level++;
    this.boss = levelDict[this.level].boss;
  }
}
