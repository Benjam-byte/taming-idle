import { effect, inject, Injectable } from '@angular/core';
import { ProfessionManagerService } from './profession-manager.service';

const INITIAL_DAMAGE = 1;
const INITIAL_PRECISION = 1;
const INITIAL_TACLE = 1;
const INITIAL_ARMORPEN = 1;

const INITIAL_TRAVELLINGSPEED = 1000;
const INITIAL_FIGHTINGSPEED = 1000;

@Injectable({ providedIn: 'root' })
export class HumanManagerService {
  professionManangerService = inject(ProfessionManagerService);
  damage = INITIAL_DAMAGE;
  precison = INITIAL_PRECISION;
  tacle = INITIAL_TACLE;
  armorPen = INITIAL_ARMORPEN;
  criticalChancePercentage = 0;

  distanceTravelled = 0;
  travellingSpeed = INITIAL_TRAVELLINGSPEED;
  fightingSpeed = INITIAL_FIGHTINGSPEED;
  searchingSpeed = 1000;
  nextTravelTime = 0;
  nextFightTime = 0;
  nextSearchTime = 0;

  constructor() {
    this.nextTravelTime = this.travellingSpeed;
    this.nextFightTime = this.fightingSpeed;
    this.nextSearchTime = this.searchingSpeed;
    effect(() => {
      this.calculateValue(this.professionManangerService.bonusList());
    });
  }

  calculateValue(bonusList: {
    damage: number;
    armorPen: number;
    tacle: number;
    travelSpeed: number;
    loot: number;
    fightSpeed: number;
  }) {
    this.damage = INITIAL_DAMAGE + bonusList.damage;
    this.tacle = INITIAL_TACLE + bonusList.tacle;
    this.armorPen = INITIAL_ARMORPEN + bonusList.armorPen;
    this.travellingSpeed = INITIAL_TRAVELLINGSPEED - bonusList.travelSpeed;
    this.fightingSpeed = INITIAL_FIGHTINGSPEED - bonusList.fightSpeed;
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
