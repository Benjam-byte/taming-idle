import { ProfessionFromJson } from '../models/professionFromJson.type';

export default class Profession {
  level: number;
  xpCap: number;
  xp: number;
  profession: string;
  description: string;
  background: string;
  color: string;
  bonusA: string;
  bonusB: string;

  constructor(profession: ProfessionFromJson) {
    this.level = 1;
    this.xpCap = 10;
    this.xp = 0;
    this.profession = profession.profession;
    this.description = profession.description;
    this.background = profession.background;
    this.color = profession.color;
    this.bonusA = profession.bonusA;
    this.bonusB = profession.bonusB;
  }

  progress() {
    this.xp += 1;
    if (this.xp === this.xpCap) {
      this.xp = 0;
      this.xpCap = this.xpCap * 10;
      this.level += 1;
    }
  }
}
