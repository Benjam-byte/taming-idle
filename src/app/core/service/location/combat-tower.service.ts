import { effect, Injectable, signal } from '@angular/core';
import Monster from '../../value-object/monster';

type Encounter = {
  createBoss: () => Monster;
  duration: number;
};

const levelDict: Record<number, Encounter> = {
  1: { createBoss: () => new Monster(5, 'slime'), duration: 10000 },
  2: { createBoss: () => new Monster(15, 'slime'), duration: 10000 },
  3: { createBoss: () => new Monster(25, 'slime'), duration: 10000 },
  4: { createBoss: () => new Monster(50, 'slime'), duration: 10000 },
  5: { createBoss: () => new Monster(80, 'slime'), duration: 10000 },
};

@Injectable({
  providedIn: 'root',
})
export class CombatTowerService {
  level = signal<number>(1);
  boss = signal<Monster>(new Monster(0, 'slime'));

  constructor() {
    const savedLevel = localStorage.getItem('level');
    if (savedLevel !== null) {
      this.level.set(Number(savedLevel));
    }

    effect(() => {
      localStorage.setItem('level', String(this.level()));
    });
    this.boss.set(levelDict[this.level()].createBoss());
  }

  retry() {
    this.boss.set(levelDict[this.level()].createBoss());
  }

  levelUp() {
    this.level.update((v) => v + 1);
    this.boss.set(levelDict[this.level()].createBoss());
  }
}
