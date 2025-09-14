import { inject, Injectable } from '@angular/core';
import { Human } from 'src/app/database/human/human.type';
import { HumanController } from 'src/app/database/human/human.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Profession } from 'src/app/database/profession/profession.type';
import { RelicManagerService } from './relic-manager.service';

@Injectable({ providedIn: 'root' })
export class HumanManagerService {
    humanControllerService = inject(HumanController);
    relicManagerService = inject(RelicManagerService);

    private _human$!: BehaviorSubject<Human>;
    nextTravelTime = Date.now();
    nextFightTime = Date.now();
    nextSearchTime = Date.now();

    get human() {
        return this._human$.value;
    }

    get human$() {
        if (!this._human$) return of(null);
        return this._human$.asObservable();
    }

    get damage() {
        return this.human.damage + this.relicManagerService.damageFromRelic;
    }

    init$() {
        return this.humanControllerService.get().pipe(
            tap((human) => (this._human$ = new BehaviorSubject(human))),
            map(() => void 0)
        );
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
            .update(this.human.id, { damage: damage + this.human.damage })
            .subscribe((human) => this._human$.next(human));
    }

    updateFromProfession(profession: Profession) {
        const human = this._human$.value;
        this.humanControllerService
            .update(human.id, this.updateStat(profession, human))
            .subscribe((human) => this._human$.next(human));
    }

    useOneRelic(relicName: string) {
        this.relicManagerService.useOneRelicByName(relicName, this.human.id);
    }

    private updateStat(profession: Profession, human: Human) {
        if (profession.level % 2 === 0)
            return this.getValueA(profession, human);
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
