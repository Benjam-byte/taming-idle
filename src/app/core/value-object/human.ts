import SkillManager from './skillManager';

export default class Human {
  damage: number;
  distanceTravelled: number;
  travellingSpeed: number;
  fightingSpeed: number;
  searchingSpeed: number;

  readonly skillManager: SkillManager;

  constructor(damage: number) {
    this.damage = damage;
    this.distanceTravelled = 0;
    this.travellingSpeed = 1000;
    this.fightingSpeed = 1000;
    this.searchingSpeed = 1000;

    this.skillManager = new SkillManager(this);
  }

  advance() {
    this.distanceTravelled++;
    this.skillManager.travelProgress();
  }

  improveTravellingSpeed() {
    this.travellingSpeed = Math.max(20, this.travellingSpeed * 0.9);
  }

  improveFightingSpeed() {
    this.fightingSpeed = Math.max(20, this.fightingSpeed * 0.9);
  }
  improveSearchingSpeed() {
    this.searchingSpeed = Math.max(20, this.searchingSpeed * 0.9);
  }
}
