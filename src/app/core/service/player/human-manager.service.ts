import { inject, Injectable } from '@angular/core';
import { Human } from 'src/app/database/human/human.type';
import { HumanController } from 'src/app/database/human/human.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Profession } from 'src/app/database/profession/profession.type';
import { RelicManagerService } from './relic-manager.service';
import { rollCompoundChance } from '../../helpers/proba-rolls';

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
        return (
            this.human.damage +
            this.relicManagerService.getDamageFromRelicById(this.human.relicId)
        );
    }

    get relic$() {
        return this._human$.pipe(
            map((human) => this.relicManagerService.getRelicById(human.relicId))
        );
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
        this.nextSearchTime = now + this._human$.value.lockPickingSpeed;
        return true;
    }

    trackDirection(map: string) {
        if (map === 'empty') return map;
        const r = rollCompoundChance(this.human.findingPercentage, 0)
            ? map
            : 'empty';
        return r;
    }

    updateDamage$(damage: number) {
        return this.humanControllerService
            .update(this.human.id, { damage: damage + this.human.damage })
            .pipe(map((human) => this._human$.next(human)));
    }

    updateFinding$(finding: number) {
        return this.humanControllerService
            .update(this.human.id, {
                findingPercentage: finding + this.human.findingPercentage,
            })
            .pipe(map((human) => this._human$.next(human)));
    }

    updateFromProfession$(profession: Profession) {
        const human = this._human$.value;
        return this.humanControllerService
            .update(
                this.human.id,
                this.updateStatFromProfession(profession, human)
            )
            .pipe(map((human) => this._human$.next(human)));
    }

    associateRelic$(relicId: string) {
        return this.humanControllerService
            .update(this.human.id, {
                relicId,
            })
            .pipe(map((human) => this._human$.next(human)));
    }

    levelUp$() {
        return this.humanControllerService
            .update(this.human.id, {
                level: this.human.level + 1,
                ...this.getStatUpdateFromMonsterLevel(),
            })
            .pipe(map((human) => this._human$.next(human)));
    }

    private getStatUpdateFromMonsterLevel() {
        const stats = [
            'damage',
            'damageSpecial',
            'defense',
            'defenseSpecial',
            'precision',
            'criticalChance',
        ] as const;

        const statPoints = 6;
        const distribution: Record<(typeof stats)[number], number> = {
            damage: 0,
            damageSpecial: 0,
            defense: 0,
            defenseSpecial: 0,
            precision: 0,
            criticalChance: 0,
        };

        const currentStats = {
            damage: this.human.damage,
            damageSpecial: this.human.damageSpecial,
            defense: this.human.defense,
            defenseSpecial: this.human.defenseSpecial,
            precision: this.human.precision,
            criticalChance: this.human.criticalChance,
        };

        let pointsLeft = statPoints;
        while (pointsLeft > 0) {
            const availableStats = stats.filter(
                (stat) =>
                    currentStats[stat] + distribution[stat] <
                    this.human.statCap[stat]
            );
            if (availableStats.length === 0) break;
            const randomStat =
                availableStats[
                    Math.floor(Math.random() * availableStats.length)
                ];

            distribution[randomStat]++;
            pointsLeft--;
        }

        return {
            damage: currentStats.damage + distribution.damage,
            damageSpecial:
                currentStats.damageSpecial + distribution.damageSpecial,
            defense: currentStats.defense + distribution.defense,
            defenseSpecial:
                currentStats.defenseSpecial + distribution.defenseSpecial,
            precision: currentStats.precision + distribution.precision,
            criticalChance:
                currentStats.criticalChance + distribution.criticalChance,
        };
    }

    private updateStatFromProfession(profession: Profession, human: Human) {
        return {
            [profession.value.stat]:
                profession.value.value +
                +human[profession.value.stat as keyof typeof human],
        };
    }
}
