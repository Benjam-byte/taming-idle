import { inject, Injectable } from '@angular/core';
import { TamedMonsterController } from 'src/app/database/tamedMonster/tamed-monster.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
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
    StatCap,
} from '../../models/monsterData';

@Injectable({
    providedIn: 'root',
})
export class TamedMonsterManagerService {
    tamedMonsterController = inject(TamedMonsterController);
    bestiaryManager = inject(BestiaryManagerService);
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
        return this.tamedMonsterList.find((monster) => monster.id === id);
    }

    tameMonster$(monster: MonsterProfile) {
        return this.tamedMonsterController
            .create(this.createTamedMonster(monster))
            .pipe(
                tap((tamedMonsterList) =>
                    this._tamedMonsterList$.next(tamedMonsterList)
                )
            );
    }

    private createTamedMonster(monster: MonsterProfile) {
        const tamedMonster = {
            index: this.tamedMonsterList.length,
            monsterId: monster.id,
            name: monster.name,
            travellingSpeed: 2000,
            fightingSpeed: 2000,
            lockPickingSpeed: 1000,
            gatherNormalBonus: 1,
            gatherEnchantedBonus: 0.5,
            lootNormalBonus: 1,
            lootEnchantedBonus: 0.5,
            findingPercentage: 0.05,
            relicId: '',
            level: 1,
            damage: 1,
            damageSpecial: 1,
            defense: 1,
            defenseSpecial: 1,
            precision: 1,
            criticalChance: 1,
            statCap: this.generateStatCap(monster.combatType),
        };
        console.log(tamedMonster);
        return tamedMonster;
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
}
