import { inject, Injectable } from '@angular/core';
import { Human } from 'src/app/database/human/human.type';
import { HumanController } from 'src/app/database/human/human.controller';
import { BehaviorSubject, EMPTY, iif, map, of, switchMap, tap } from 'rxjs';
import { RelicManagerService } from './relic-manager.service';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { TraitName } from '../../enum/trait.enum';
import { ProfessionName } from '../../enum/profession-name.enum';
import { XpInfo } from '../../models/xpInfo';
import { ProfessionManagerService } from './profession-manager.service';

@Injectable({ providedIn: 'root' })
export class HumanManagerService {
    humanControllerService = inject(HumanController);
    professionManagerService = inject(ProfessionManagerService);
    relicManagerService = inject(RelicManagerService);

    private _human$!: BehaviorSubject<Human>;

    get human() {
        return this._human$.value;
    }

    get human$() {
        if (!this._human$) return of(null);
        return this._human$.asObservable();
    }

    get humanInTamedMonsterFormat$() {
        return this._human$
            .asObservable()
            .pipe(map((human) => this.toTamedMonsterFormat(human)));
    }

    get humanInTamedMonsterFormat() {
        return this.toTamedMonsterFormat(this.human);
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

    updateDamage$(damage: number) {
        return this.humanControllerService
            .update(this.human.id, { damage: damage + this.human.damage })
            .pipe(tap((human) => this._human$.next(human)));
    }

    updateFinding$(finding: number) {
        return this.humanControllerService
            .update(this.human.id, {
                findingPercentage: finding + this.human.findingPercentage,
            })
            .pipe(tap((human) => this._human$.next(human)));
    }

    associateRelic$(relicId: string) {
        return this.humanControllerService
            .update(this.human.id, {
                relicId,
            })
            .pipe(tap((human) => this._human$.next(human)));
    }

    xpProfession$(name: string, xpInfo: XpInfo) {
        const next = this.human.availableProfession.map((monsterProfession) =>
            monsterProfession.name === name
                ? {
                      ...monsterProfession,
                      xp: xpInfo.newXp,
                      level: Math.min(
                          xpInfo.newLevel,
                          monsterProfession.levelCap
                      ),
                  }
                : monsterProfession
        );
        return this.humanControllerService
            .update(this.human.id, {
                availableProfession: next,
            })
            .pipe(
                tap((human) => this._human$.next(human)),
                switchMap(() =>
                    iif(() => xpInfo.isLevelUp, this.levelUp$(name), EMPTY)
                )
            );
    }

    levelUp$(name: string) {
        return this.humanControllerService
            .update(this.human.id, {
                level: this.human.level + 1,
                ...this.getStatUpdateFromMonsterLevel(),
                ...this.updateStatFromProfession(name, this.human),
            })
            .pipe(tap((human) => this._human$.next(human)));
    }

    private toTamedMonsterFormat(human: Human): TamedMonster {
        return {
            id: '0',
            index: 0,
            monsterSpecies: 'Terra larva',
            monsterId: 'Terra_larva',
            name: 'player',
            travellingSpeed: human.travellingSpeed,
            fightingSpeed: human.fightingSpeed,
            lockPickingSpeed: human.lockPickingSpeed,
            gatherNormalBonus: human.gatherNormalBonus,
            gatherEnchantedBonus: human.gatherEnchantedBonus,
            lootNormalBonus: human.lootNormalBonus,
            lootEnchantedBonus: human.lootEnchantedBonus,
            findingPercentage: human.findingPercentage,
            relicId: human.relicId,
            level: human.level,
            damage: human.damage,
            damageSpecial: human.damageSpecial,
            defense: human.defense,
            defenseSpecial: human.defenseSpecial,
            precision: human.precision,
            criticalChance: human.criticalChance,
            statCap: human.statCap,
            trait: TraitName.Multiskilled,
            availableProfession: this.getAvailalbleProfession(),
        };
    }

    private getAvailalbleProfession() {
        if (this.human.availableProfession)
            return this.human.availableProfession;
        return [
            ProfessionName.Alchimiste,
            ProfessionName.Botaniste,
            ProfessionName.Fermier,
            ProfessionName.Guerrier,
            ProfessionName.Necromancien,
            ProfessionName.Pisteur,
            ProfessionName.Voleur,
            ProfessionName.Voyageur,
        ].map((name) => ({ name, level: 0, xp: 0, levelCap: 10 }));
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

    private updateStatFromProfession(professionName: string, human: Human) {
        const profession =
            this.professionManagerService.getProfessionByName(professionName);
        return {
            [profession.value.stat]:
                profession.value.value +
                +human[profession.value.stat as keyof typeof human],
        };
    }
}
