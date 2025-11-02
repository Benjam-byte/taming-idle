import { inject, Injectable } from '@angular/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    map,
    Observable,
    of,
    tap,
} from 'rxjs';
import { RegionController } from 'src/app/database/region/region.controller';
import { Region } from 'src/app/database/region/region.type';
import { BestiaryManagerService } from '../monster/bestiary-manager.service';
import Monster from '../../value-object/monster';
import { roll } from '../../helpers/proba-rolls';
import { TamedMonsterManagerService } from '../monster/tamed-monster-manager.service';

@Injectable({
    providedIn: 'root',
})
export class RegionManagerService {
    regionControllerService = inject(RegionController);
    bestiaryManagerService = inject(BestiaryManagerService);
    tamedMonsterManagerService = inject(TamedMonsterManagerService);

    private _region$!: BehaviorSubject<Region>;

    updateFunctionListByParameter$: Record<
        string,
        (value: any) => Observable<Region>
    > = {
        existingMonsterType: (value) => this.updateExistingMonsterType$(value),
        savageMonsterLevel: (value) =>
            this.updateSelectedRegionSavageMonsterLevel$(value),
        monsterSpawnRate: (value) =>
            this.updateSelectedRegionMonsterSpawnRate$(value),
        enchantedMonsterRate: (value) =>
            this.updateSelectedRegionEnchantedMonsterRate$(value),
        monsterWithTresorDropPercentage: (value) =>
            this.updateSelectedRegionMonsterChestRate$(value),
        tresorMapSpawnRate: (value) =>
            this.updateSelectedRegionChestSpawnRate$(value),
        highQualityChest: (value) =>
            this.updateSelectedRegionQualityChest$(value),
        resourceQuantity: (value) =>
            this.updateSelectedRegionWheatDropPercentage$(value),
        enchantedResource: (value) =>
            this.updateSelectedRegionEnchantedResource$(value),
        monsterResourceQuantity: (value) =>
            this.updateSelectedRegionMonsterDropPercentage$(value),
        enchantedMonsterResource: (value) =>
            this.updateSelectedRegionEnchantedMonsterDropPercentage$(value),
        eggSpawnRate: (value) => this.updateSelectedRegionEggSpawnRate$(value),
        monsterEggProbability: (value) =>
            this.updateSelectedRegionMonsterEggProbability$(value),
    };

    get region() {
        return this._region$.value;
    }

    get region$() {
        if (!this._region$) return of(null);
        return this._region$.asObservable().pipe(distinctUntilChanged());
    }

    CreateMonster() {
        const monsterName = this.pickMonsterWeightedByIndex(
            this.region.existingMonsterType
        );
        const monster =
            this.bestiaryManagerService.getMonsterByName(monsterName);
        if (!monster) throw new Error('monster introuvable');
        if (!monster?.seen) {
            this.bestiaryManagerService.seeMonster(monster.id);
        }
        const isEnchanted = Boolean(roll(this.region.enchantedMonsterRate));
        return new Monster(monster, isEnchanted, this.region.monsterLevel);
    }

    init$() {
        return this.regionControllerService
            .getSelected()
            .pipe(filter((region) => !!region))
            .pipe(
                tap((region) => (this._region$ = new BehaviorSubject(region))),
                map(() => void 0)
            );
    }

    getChestMapDict(): Record<string, number> {
        return {
            monster: 0,
            tresor: this.region.monsterWithTresorDropPercentage,
            empty: 1 - this.region.monsterWithTresorDropPercentage,
        };
    }

    getSelectedRegionMapDict(): Record<string, number> {
        return {
            tresor: this.region.tresorMapSpawnRate,
            monster: this.region.monsterSpawnRate,
            empty:
                1 -
                (this.region.monsterSpawnRate + this.region.tresorMapSpawnRate),
        };
    }

    updateSelectedRegionMonsterEggProbability$(value: {
        1: number;
        2: number;
        3: number;
    }) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                monsterEggProbability: {
                    1: this.region.monsterEggProbability[1] + value[1],
                    2: this.region.monsterEggProbability[2] + value[2],
                    3: this.region.monsterEggProbability[3] + value[3],
                },
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionEggSpawnRate$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                eggSpawnRate: this.region.eggSpawnRate + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionMonsterLevel$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                monsterLevel: this.region.monsterLevel + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionAssignedMonster$(monsterId: string) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                assignedMonsterId: monsterId,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionEnchantedResource$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                enchantedResource: this.region.enchantedResource + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionSavageMonsterLevel$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                savageMonsterLevel: this.region.savageMonsterLevel + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionChestSpawnRate$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                tresorMapSpawnRate: this.region.tresorMapSpawnRate + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionMonsterChestRate$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                monsterWithTresorDropPercentage:
                    this.region.monsterWithTresorDropPercentage + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionMonsterSpawnRate$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                monsterSpawnRate: this.region.monsterSpawnRate + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionEnchantedMonsterRate$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                enchantedMonsterRate: this.region.enchantedMonsterRate + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionMonsterDropPercentage$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                monsterResourceQuantity:
                    this.region.monsterResourceQuantity + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionEnchantedMonsterDropPercentage$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                enchantedMonsterResource:
                    this.region.enchantedMonsterResource + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionWheatDropPercentage$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                resourceQuantity: this.region.resourceQuantity + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateSelectedRegionQualityChest$(value: number) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                highQualityChest: this.region.highQualityChest + value,
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    updateExistingMonsterType$(value: string) {
        return this.regionControllerService
            .updateOne(this.region.id, {
                existingMonsterType: [
                    ...this.region.existingMonsterType,
                    value,
                ],
            })
            .pipe(tap((region) => this._region$.next(region)));
    }

    private pickMonsterWeightedByIndex(monsterList: string[]): string {
        const weights = monsterList.map((_, i) => 1 / (i + 1));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const rand = Math.random() * totalWeight;
        let cumulative = 0;
        for (let i = 0; i < monsterList.length; i++) {
            cumulative += weights[i];
            if (rand <= cumulative) {
                return monsterList[i];
            }
        }
        return monsterList[monsterList.length - 1];
    }
}
