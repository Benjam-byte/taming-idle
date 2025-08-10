import { effect, signal } from '@angular/core';
import { ProfessionFromJson } from '../models/professionFromJson.type';

export default class Profession {
  level = signal<number>(1);
  xp = signal<number>(0);
  profession: string;
  description: string;
  background: string;
  color: string;
  bonusA: string;
  bonusB: string;
  valueA: { stat: string; value: number };
  valueB: { stat: string; value: number };

  constructor(profession: ProfessionFromJson) {
    this.profession = profession.profession;
    this.description = profession.description;
    this.background = profession.background;
    this.color = profession.color;
    this.bonusA = profession.bonusA;
    this.bonusB = profession.bonusB;
    this.valueA = profession.valueA;
    this.valueB = profession.valueB;

    const savedProfession = localStorage.getItem(this.profession);
    if (savedProfession !== null) {
      const parsedProfession = JSON.parse(savedProfession);
      this.level.set(Number(parsedProfession.level));
      this.xp.set(Number(parsedProfession.xp));
    }

    effect(() => {
      localStorage.setItem(
        this.profession,
        JSON.stringify({ level: this.level(), xp: this.xp() })
      );
    });
  }

  getValueA() {
    if (this.level() === 1) return { [this.valueA.stat]: 0 };
    else return { [this.valueA.stat]: (this.level() / 2) * this.valueA.value };
  }

  getValueB() {
    if (this.level() <= 2) return { [this.valueB.stat]: 0 };
    else {
      const index = (this.level() - 1) / 2;
      console.log(this.profession, index);
      return {
        [this.valueB.stat]: index * this.valueB.value,
      };
    }
  }

  progress(step = 1) {
    const xpCap = 10 ** this.level();
    this.xp.update((value) => value + step);
    if (this.xp() >= xpCap) {
      this.xp.set(0);
      this.level.update((value) => value + 1);
    }
  }
}
