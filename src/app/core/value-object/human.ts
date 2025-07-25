import SkillManager from './skillManager';

export default class Human {
  damage: number;
  distanceTravelled: number;
  travellingSpeed: number;
  fightingSpeed: number;
  searchingSpeed: number;
  nextTravelTime = 0;
  nextFightTime = 0;
  nextSearchTime = 0;

  readonly skillManager: SkillManager;

  constructor(damage: number) {
    this.damage = damage;
    this.distanceTravelled = 0;
    this.travellingSpeed = 1000;
    this.fightingSpeed = 1000;
    this.searchingSpeed = 1000;

    this.skillManager = new SkillManager(this);

    const now = 0;
    this.nextTravelTime = now + this.travellingSpeed;
    this.nextFightTime = now + this.fightingSpeed;
    this.nextSearchTime = now + this.searchingSpeed;
  }

  getNextActionTimes() {
    return {
      travel: this.nextTravelTime,
      fight: this.nextFightTime,
      search: this.nextSearchTime,
    };
  }

  getClickDamage(now: number) {
    if (now < this.nextFightTime) return 0;
    else return this.damage;
  }

  advance(now: number): boolean {
    if (now < this.nextTravelTime) return false;
    this.distanceTravelled++;
    this.nextTravelTime = now + this.travellingSpeed;
    this.skillManager.travelProgress();
    return true;
  }

  fight(now: number): boolean {
    if (now < this.nextFightTime) return false;
    this.nextFightTime = now + this.fightingSpeed;
    this.skillManager.fightProgress();
    return true;
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
