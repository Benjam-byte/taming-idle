import Profession from './profession';
import professionList from './professionJson.json';

export default class Human {
  damage: number;
  distanceTravelled: number;
  travellingSpeed: number;
  fightingSpeed: number;
  searchingSpeed: number;
  nextTravelTime = 0;
  nextFightTime = 0;
  nextSearchTime = 0;
  copper = 0;

  readonly professionList: Profession[];

  constructor(damage: number) {
    this.damage = damage;
    this.distanceTravelled = 0;
    this.travellingSpeed = 1000;
    this.fightingSpeed = 1000;
    this.searchingSpeed = 1000;

    this.professionList = professionList.map(
      (profession) => new Profession(profession)
    );

    const now = 0;
    this.nextTravelTime = now + this.travellingSpeed;
    this.nextFightTime = now + this.fightingSpeed;
    this.nextSearchTime = now + this.searchingSpeed;
  }

  getLoot() {
    return this.copper;
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

  receiveLoot(copper: number) {
    this.copper = this.copper + copper;
  }

  advance(now: number): boolean {
    if (now < this.nextTravelTime) return false;
    this.distanceTravelled++;
    this.nextTravelTime = now + this.travellingSpeed;
    return true;
  }

  fight(now: number): boolean {
    if (now < this.nextFightTime) return false;
    this.nextFightTime = now + this.fightingSpeed;
    return true;
  }

  search(now: number): boolean {
    if (now < this.nextSearchTime) return false;
    this.nextSearchTime = now + this.searchingSpeed;
    return true;
  }
}
