import { inject, Injectable } from '@angular/core';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { RegionManagerService } from '../location/region.service';
import { TamedMonsterManagerService } from '../monster/tamed-monster-manager.service';
import { HumanManagerService } from './human-manager.service';
import { map, Observable, of, switchMap } from 'rxjs';
import { Region } from 'src/app/database/region/region.type';
import { calculateMathFunction } from '../../helpers/function/function';
import { Function } from '../../models/functionType';
import { Profession } from 'src/app/database/profession/profession.type';
import { BroadcastService } from '../Ui/broadcast.service';
import { ProfessionManagerService } from './profession-manager.service';
import { XpInfo } from '../../models/xpInfo';
import { RelicManagerService } from './relic-manager.service';
import { rollCompoundChance } from '../../helpers/proba-rolls';
import { ProfessionName } from '../../enum/profession-name.enum';

const XP_STEP = 1;
const PLAYER_ID = 'Terra larva';

@Injectable({
    providedIn: 'root',
})
export class AssignedMonsterManagerService {
    regionManager = inject(RegionManagerService);
    tamedMonsterManager = inject(TamedMonsterManagerService);
    humanManager = inject(HumanManagerService);
    professionManager = inject(ProfessionManagerService);
    relicManager = inject(RelicManagerService);
    broadcastMessageService = inject(BroadcastService);

    nextTravelTime = Date.now();
    nextFightTime = Date.now();
    nextSearchTime = Date.now();

    get assignedMonster() {
        if (this.regionManager.region.assignedMonsterId === PLAYER_ID) {
            return this.humanManager.humanInTamedMonsterFormat;
        } else {
            return this.tamedMonsterManager.getMonsterById(
                this.regionManager.region.assignedMonsterId
            );
        }
    }

    get assignedMonster$() {
        return (this.regionManager.region$ as Observable<Region>).pipe(
            switchMap((region) => {
                const assignedMonsterId = region.assignedMonsterId;
                if (assignedMonsterId === PLAYER_ID) {
                    return this.humanManager.humanInTamedMonsterFormat$;
                } else {
                    return of(
                        this.tamedMonsterManager.getMonsterById(
                            assignedMonsterId
                        )
                    );
                }
            })
        );
    }

    get damage() {
        return (
            this.assignedMonster.damage +
            this.relicManager.getDamageFromRelicById(
                this.assignedMonster.relicId
            )
        );
    }

    getClickDamage(now: number) {
        if (now < this.nextFightTime) return 0;
        else return this.damage;
    }

    advance(now: number): boolean {
        if (now < this.nextTravelTime) return false;
        this.nextTravelTime = now + this.assignedMonster.travellingSpeed;
        return true;
    }

    fight(now: number): boolean {
        if (now < this.nextFightTime) return false;
        this.nextFightTime = now + this.assignedMonster.fightingSpeed;
        return true;
    }

    search(now: number): boolean {
        if (now < this.nextSearchTime) return false;
        this.nextSearchTime = now + this.assignedMonster.lockPickingSpeed;
        return true;
    }

    trackDirection(map: string) {
        if (map === 'empty') return map;
        const r = rollCompoundChance(this.assignedMonster.findingPercentage, 0)
            ? map
            : 'empty';
        return r;
    }

    xpByProfessionName$(name: string) {
        if (
            !this.assignedMonster.availableProfession
                .map((profession) => profession.name)
                .includes(name as ProfessionName)
        )
            return of();
        const profession = this.professionManager.getProfessionByName(name);
        const xpInfo = this.progress(profession);
        if (this.assignedMonster.monsterSpecies === PLAYER_ID) {
            return this.humanManager
                .xpProfession$(name, xpInfo)
                .pipe(map(() => void 0));
        } else {
            return this.tamedMonsterManager
                .xpProfession$(name, this.assignedMonster.id, xpInfo)
                .pipe(map(() => void 0));
        }
    }

    getXpCap(currentLevel: number, func: Function) {
        return calculateMathFunction(func, currentLevel);
    }

    progress(profession: Profession): XpInfo {
        const monsterProfession = this.getProfessionFromMonsterByName(
            this.assignedMonster,
            profession.name
        );
        const xpCap = this.getXpCap(
            monsterProfession.level,
            profession.function
        );
        let newXp = monsterProfession.xp + XP_STEP;
        let newLevel = monsterProfession.level;
        let isLevelUp = false;
        if (newXp >= xpCap) {
            newXp = 0;
            newLevel = newLevel + 1;
            isLevelUp = true;
            this.broadcastMessageService.displayMessage({
                message: `${this.assignedMonster.name} ${profession.name} has leveled up`,
            });
        }
        return { isLevelUp, newLevel, newXp };
    }

    private getProfessionFromMonsterByName(
        monster: TamedMonster,
        name: string
    ) {
        const profession = monster.availableProfession.find(
            (profession) => profession.name === name
        );
        if (!profession) throw new Error('profession not found');
        return profession;
    }
}
