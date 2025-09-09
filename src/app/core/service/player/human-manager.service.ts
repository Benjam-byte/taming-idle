import { inject, Injectable } from '@angular/core';
import { Human } from 'src/app/database/human/human.type';
import { HumanController } from 'src/app/database/human/human.controller';
import { BehaviorSubject, map, of } from 'rxjs';
import { Profession } from 'src/app/database/profession/profession.type';

@Injectable({ providedIn: 'root' })
export class HumanManagerService {
  humanControllerService = inject(HumanController);

  private _human$!: BehaviorSubject<Human>;
  nextTravelTime = Date.now();
  nextFightTime = Date.now();
  nextSearchTime = Date.now();

  constructor() {
    this.humanControllerService
      .get()
      .pipe(map((human) => (this._human$ = new BehaviorSubject(human))))
      .subscribe();
  }

  get human() {
    return this._human$.value;
  }

  get human$() {
    if (!this._human$) return of(null);
    return this._human$.asObservable();
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
    else return this._human$.value.damage;
  }

  advance(now: number): boolean {
    if (now < this.nextTravelTime) return false;
    this.humanControllerService
      .update(this._human$.value.id, {
        distanceTravelled: this._human$.value.distanceTravelled + 1,
      })
      .subscribe((human) => this._human$.next(human));
    this.nextTravelTime = now + this._human$.value.travellingSpeed;
    return true;
  }

  fight(now: number): boolean {
    if (now < this.nextFightTime) return false;
    this.nextFightTime = now + this._human$.value.fightingSpeed;
    return true;
  }

  search(now: number): boolean {
    if (now < this.nextSearchTime) return false;
    this.nextSearchTime = now + this._human$.value.searchingSpeed;
    return true;
  }

  updateDamage(damage: number) {
    this.humanControllerService
      .update(this.human.id, { damage })
      .subscribe((human) => this._human$.next(human));
  }

  updateFromProfession(profession: Profession) {
    const human = this._human$.value;
    this.humanControllerService
      .update(human.id, this.updateStat(profession, human))
      .subscribe((human) => this._human$.next(human));
  }

  private updateStat(profession: Profession, human: Human) {
    if (profession.level % 2 === 0) return this.getValueA(profession, human);
    else return this.getValueB(profession, human);
  }

  private getValueA(profession: Profession, human: Human) {
    return {
      [profession.valueA.stat]:
        profession.valueA.value +
        +human[profession.valueA.stat as keyof typeof human],
    };
  }

  private getValueB(profession: Profession, human: Human) {
    return {
      [profession.valueB.stat]:
        profession.valueB.value +
        +human[profession.valueB.stat as keyof typeof human],
    };
  }
}
