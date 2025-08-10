import { inject, Injectable } from '@angular/core';
import { ProfessionManagerService } from './profession-manager.service';

@Injectable({ providedIn: 'root' })
export class HumanManagerService {
  professionManangerService = inject(ProfessionManagerService);
  damage = 1;
  precison = 1;
  tacle = 1;
  armorPen = 1;
  criticalChancePercentage = 0;

  distanceTravelled = 0;
  travellingSpeed = 1000;
  fightingSpeed = 1000;
  searchingSpeed = 1000;
  nextTravelTime = 0;
  nextFightTime = 0;
  nextSearchTime = 0;

  constructor() {
    this.nextTravelTime = this.travellingSpeed;
    this.nextFightTime = this.fightingSpeed;
    this.nextSearchTime = this.searchingSpeed;
    this.calculateValue();
  }

  calculateValue() {
    const bonusList = this.professionManangerService.getBonusList();
    this.damage = this.damage + bonusList.damage;
    this.tacle = this.tacle + bonusList.tacle;
    this.armorPen = this.armorPen + bonusList.armorPen;
    this.travellingSpeed = this.travellingSpeed - bonusList.travelSpeed;
    this.fightingSpeed = this.fightingSpeed - bonusList.fightSpeed;
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
