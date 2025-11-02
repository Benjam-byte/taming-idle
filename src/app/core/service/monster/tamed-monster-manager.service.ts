import { inject, Injectable } from '@angular/core';
import { TamedMonsterController } from 'src/app/database/tamedMonster/tamed-monster.controller';
import {
    BehaviorSubject,
    map,
    of,
    tap,
    filter,
    Observable,
    switchMap,
    iif,
    EMPTY,
    range,
    concatMap,
    last,
} from 'rxjs';
import { BroadcastService } from '../Ui/broadcast.service';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { BestiaryManagerService } from './bestiary-manager.service';
import {
    CombatType,
    MonsterProfile,
} from 'src/app/database/bestiary/bestiary.type';
import {
    ALL_STATS,
    ARCHETYPE_FAV,
    CombatStatKey,
} from '../../models/monsterData';
import { ProfessionName } from '../../enum/profession-name.enum';
import { XpInfo } from '../../models/xpInfo';
import {
    getStatUpdateFromMonsterLevel,
    updateStatFromProfession,
} from '../../helpers/stat-calculator';
import { ProfessionManagerService } from '../player/profession-manager.service';
import { calculateMathFunction } from '../../helpers/function/function';
import { Function } from '../../models/functionType';

@Injectable({
    providedIn: 'root',
})
export class TamedMonsterManagerService {
    tamedMonsterController = inject(TamedMonsterController);
    bestiaryManager = inject(BestiaryManagerService);
    professionManager = inject(ProfessionManagerService);
    broadcastService = inject(BroadcastService);

    private _tamedMonsterList$!: BehaviorSubject<TamedMonster[]>;

    get tamedMonsterList() {
        return this._tamedMonsterList$.value;
    }

    get tamedMonsterList$() {
        if (!this._tamedMonsterList$) return of(null);
        return this._tamedMonsterList$
            .asObservable()
            .pipe(map((list) => [...list].sort((a, b) => a.index - b.index)));
    }

    init$() {
        return this.tamedMonsterController.getAll().pipe(
            tap(
                (tamedMonsterList) =>
                    (this._tamedMonsterList$ = new BehaviorSubject(
                        tamedMonsterList
                    ))
            ),
            map(() => void 0)
        );
    }

    getImageFromMonster(name: string) {
        const monsterProfile = this.bestiaryManager.getMonsterByName(name);
        if (!monsterProfile) throw new Error('monster not found');
        return monsterProfile.image;
    }

    getMonsterById(id: string) {
        const monster = this.tamedMonsterList.find(
            (monster) => monster.id === id
        );
        if (!monster) throw new Error('monster not found');
        return monster;
    }

    getMonsterById$(id: string): Observable<TamedMonster> {
        return this._tamedMonsterList$.pipe(
            filter(
                (monsterList): monsterList is TamedMonster[] => !!monsterList
            ),
            map((monsterList) =>
                monsterList.find((monster) => monster.id === id)
            )
        ) as Observable<TamedMonster>;
    }

    tameMonster$(monster: MonsterProfile, pseudo: string) {
        return this.tamedMonsterController
            .create(this.createTamedMonster(monster, pseudo))
            .pipe(
                tap((tamedMonsterList) =>
                    this._tamedMonsterList$.next(tamedMonsterList)
                )
            );
    }

    tameMonsterByMonsterName$(name: string, pseudo: string) {
        const monster = this.bestiaryManager.getMonsterByName(name);
        if (!monster) throw new Error('Monster not found');
        return this.tameMonster$(monster, pseudo);
    }

    associateRelic$(monsterId: string, relicId: string) {
        return this.tamedMonsterController
            .updateOne(monsterId, {
                relicId,
            })
            .pipe(
                tap((monsterList) => this._tamedMonsterList$.next(monsterList))
            );
    }

    updateName$(name: string, id: string) {
        return this.tamedMonsterController
            .updateOne(id, { name })
            .pipe(
                tap((tamedMonsterList) =>
                    this._tamedMonsterList$.next(tamedMonsterList)
                )
            );
    }

    xpAllProfessionByXpAmount$(
        professionXpList: {
            professionName: ProfessionName;
            xpAmount: number;
        }[],
        monsterId: string
    ) {
        const monster = this.getMonsterById(monsterId);
        if (!monster) throw new Error('Monster not found');

        const gains = new Map<ProfessionName, number>();
        for (const { professionName, xpAmount } of professionXpList) {
            if (xpAmount <= 0) continue;
            gains.set(professionName, xpAmount);
        }
        if (gains.size === 0) {
            return this.tamedMonsterController.updateOne(monster.id, {
                availableProfession: monster.availableProfession,
            });
        }

        const capByProfession = new Map<
            ProfessionName,
            (level: number) => number
        >();
        for (const name of gains.keys()) {
            const cfg = this.professionManager.getProfessionByName(name);
            if (!cfg) throw new Error(`Profession config not found: ${name}`);
            capByProfession.set(name, (lvl: number) =>
                this.getXpCap(lvl, cfg.function)
            );
        }
        const next = monster.availableProfession.map((profession) => {
            const gain = gains.get(profession.name);
            if (!gain || gain <= 0) return profession;

            const getCap = capByProfession.get(profession.name)!;
            const { level, numberOfLevel, xp } = this.applyXpGain(
                profession.level,
                profession.xp,
                gain,
                profession.levelCap,
                getCap
            );

            this.levelUpNTimes$(
                profession.name,
                monster,
                numberOfLevel
            ).subscribe();

            return { ...profession, level, xp };
        });

        return this.tamedMonsterController
            .updateOne(monster.id, {
                availableProfession: next,
            })
            .pipe(
                tap((monsterList) => this._tamedMonsterList$.next(monsterList))
            );
    }

    xpProfession$(professionName: string, monsterId: string, xpInfo: XpInfo) {
        const monster = this.getMonsterById(monsterId);
        const next = monster.availableProfession.map((monsterProfession) =>
            monsterProfession.name === professionName
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
        return this.tamedMonsterController
            .updateOne(monster.id, {
                availableProfession: next,
            })
            .pipe(
                tap((monsterList) => this._tamedMonsterList$.next(monsterList)),
                switchMap(() =>
                    iif(
                        () => xpInfo.isLevelUp,
                        this.levelUp$(professionName, monster),
                        EMPTY
                    )
                )
            );
    }

    levelUp$(professionName: string, monster: TamedMonster) {
        const profession =
            this.professionManager.getProfessionByName(professionName);
        return this.tamedMonsterController
            .updateOne(monster.id, {
                ...getStatUpdateFromMonsterLevel(monster),
                ...updateStatFromProfession(profession, monster),
            })
            .pipe(
                tap((monsterList) => this._tamedMonsterList$.next(monsterList))
            );
    }

    levelUpNTimes$(professionName: string, monster: TamedMonster, n: number) {
        return range(0, n).pipe(
            concatMap(() => this.levelUp$(professionName, monster)),
            last()
        );
    }

    private getXpCap(currentLevel: number, func: Function) {
        return calculateMathFunction(func, currentLevel);
    }

    private createTamedMonster(
        monster: MonsterProfile,
        pseudo: string
    ): Omit<TamedMonster, 'id'> {
        const tamedMonster = {
            index: this.tamedMonsterList.length,
            monsterSpecies: monster.name,
            name: pseudo,
            travellingSpeed: 2000,
            fightingSpeed: 2000,
            lockPickingSpeed: 1000,
            gatherNormalBonus: this.canFarm(monster.availableProfession)
                ? 1
                : 0,
            gatherEnchantedBonus: this.canFarm(monster.availableProfession)
                ? 0.5
                : 0,
            lootNormalBonus: this.canFight(monster.availableProfession) ? 1 : 0,
            lootEnchantedBonus: this.canFight(monster.availableProfession)
                ? 0.5
                : 0,
            findingPercentage: this.canPist(monster.availableProfession)
                ? 0.05
                : 0,
            relicId: '',
            level: 1,
            damage: 1,
            damageSpecial: 1,
            defense: 1,
            defenseSpecial: 1,
            precision: 1,
            criticalChance: 1,
            statCap: this.generateStatCap(monster.combatType),
            trait: monster.trait,
            availableProfession: this.generateProfession(
                monster.availableProfession
            ),
            monsterId: monster.id,
        };
        return tamedMonster;
    }

    private canFarm(professionList: ProfessionName[]) {
        return professionList.includes(ProfessionName.Fermier);
    }

    private canFight(professionList: ProfessionName[]) {
        return professionList.includes(ProfessionName.Guerrier);
    }

    private canPist(professionList: ProfessionName[]) {
        return professionList.includes(ProfessionName.Pisteur);
    }

    private generateProfession(professionList: ProfessionName[]) {
        return professionList.map((profession) => ({
            name: profession,
            level: 0,
            xp: 0,
            levelCap: 30,
        }));
    }

    private generateStatCap(archetype: CombatType): Record<string, number> {
        const FAV_MAX = Math.floor(Math.random() * (120 - 110 + 1)) + 110;
        const OTHER_MAX = 90;
        const OTHER_MIN = 60; // on ne descend jamais en dessous
        const TOTAL = Math.floor(Math.random() * (540 - 520 + 1)) + 520;
        const favored = new Set<CombatStatKey>(ARCHETYPE_FAV[archetype]);

        // Base équilibrée à 90 (6 * 90 = 540)
        const caps: Record<CombatStatKey, number> = {
            damage: 90,
            damageSpecial: 90,
            defense: 90,
            defenseSpecial: 90,
            precision: 90,
            criticalChance: 90,
        };

        // Tant qu'on peut encore monter au moins une stat favorisée (<= 120)
        // et qu'il existe au moins un donneur non favorisé (> 60), on transfère.
        let safety = 10_000; // filet de sécurité boucle
        while (safety-- > 0) {
            const canIncreaseFav: CombatStatKey[] = ALL_STATS.filter(
                (s) => favored.has(s) && caps[s] < FAV_MAX
            );
            if (canIncreaseFav.length === 0) break;

            const donors: CombatStatKey[] = ALL_STATS.filter(
                (s) => !favored.has(s) && caps[s] > OTHER_MIN
            );
            if (donors.length === 0) break;

            // Pondération côté favoris : plus on est loin du cap 120, plus la proba est grande
            const favWeights = canIncreaseFav.map((s) => FAV_MAX - caps[s]); // [1..30]
            const chosenFav = this.weightedPick(canIncreaseFav, favWeights);
            if (!chosenFav) break;

            // Donneur : on privilégie ceux qui ont encore de la marge au-dessus de 60
            const donorWeights = donors.map((s) => caps[s] - OTHER_MIN); // [1..30]
            const chosenDonor = this.weightedPick(donors, donorWeights);
            if (!chosenDonor) break;

            // Transfert 1 point (total reste 540)
            caps[chosenFav] += 1;
            caps[chosenDonor] -= 1;

            // Si un favori atteint 120, il sort naturellement du pool
        }

        // Clamp de sécurité (devrait déjà être respecté par le process)
        for (const s of ALL_STATS) {
            if (favored.has(s)) {
                caps[s] = Math.min(FAV_MAX, caps[s]);
            } else {
                caps[s] = Math.max(OTHER_MIN, Math.min(OTHER_MAX, caps[s]));
            }
        }

        // Ajustement final si jamais de légers décalages
        const sum =
            caps.damage +
            caps.damageSpecial +
            caps.defense +
            caps.defenseSpecial +
            caps.precision +
            caps.criticalChance;
        if (sum !== TOTAL) {
            // Corrige en priorité sur une stat non favorisée dans les bornes
            const diff = TOTAL - sum; // positif = il manque, négatif = trop
            const pool =
                diff > 0
                    ? ALL_STATS.filter((s) =>
                          favored.has(s)
                              ? caps[s] < FAV_MAX
                              : caps[s] < OTHER_MAX
                      )
                    : ALL_STATS.filter((s) =>
                          favored.has(s) ? caps[s] > 0 : caps[s] > OTHER_MIN
                      );
            for (let i = 0; i < Math.abs(diff); i++) {
                if (pool.length === 0) break;
                const idx = Math.floor(Math.random() * pool.length);
                const key = pool[idx];
                caps[key] += diff > 0 ? 1 : -1;
            }
        }

        return caps;
    }

    private weightedPick<T>(items: T[], weights: number[]): T | null {
        const sum = weights.reduce((a, b) => a + b, 0);
        if (sum <= 0) return null;
        let r = Math.random() * sum;
        for (let i = 0; i < items.length; i++) {
            r -= weights[i];
            if (r <= 0) return items[i];
        }
        return items[items.length - 1] ?? null;
    }

    private applyXpGain(
        currentLevel: number,
        currentXp: number,
        xpGain: number,
        maxLevel: number,
        getCap: (level: number) => number
    ): { level: number; numberOfLevel: number; xp: number } {
        let level = currentLevel;
        let xp = currentXp + xpGain;
        let numberOfLevel = 0;

        // On consomme l'XP en franchissant les caps successifs
        while (level < maxLevel) {
            const cap = getCap(level);
            if (xp < cap) break; // pas assez pour passer
            xp -= cap; // on consomme le cap du niveau
            level += 1; // niveau suivant
            numberOfLevel += 1;
        }

        // À max level, on peut soit garder l'XP résiduelle, soit la clamp à 0.
        // Ici on la remet à 0 pour éviter un "stock" inutile.
        if (level >= maxLevel) {
            level = maxLevel;
            xp = 0;
        }

        return { level, numberOfLevel, xp };
    }
}
