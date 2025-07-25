import Human from './human';

export default class SkillManager {
  travelXp: number;
  travelXpCap: number;
  fightXp: number;
  fightXpCap: number;
  searchXp: number;
  searchXpCap: number;

  constructor(private readonly human: Human) {
    this.travelXp = 0;
    this.travelXpCap = 10;
    this.fightXp = 0;
    this.fightXpCap = 10;
    this.searchXp = 0;
    this.searchXpCap = 10;
  }

  travelProgress() {
    this.travelXp += 1;

    if (this.travelXp === this.travelXpCap) {
      this.travelXp = 0;
      this.travelXpCap = this.travelXpCap * 10;
      this.human.improveTravellingSpeed();
    }
  }

  fightProgress() {
    this.fightXp += 1;

    if (this.fightXp === this.fightXpCap) {
      this.fightXp = 0;
      this.fightXpCap = this.fightXpCap * 10;
      this.human.improveFightingSpeed();
    }
  }

  searchProgress() {
    this.searchXp += 1;

    if (this.searchXp === this.searchXpCap) {
      this.searchXp = 0;
      this.searchXpCap = this.searchXpCap * 10;
      this.human.improveSearchingSpeed();
    }
  }
}
