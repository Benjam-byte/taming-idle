import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, of, tap } from 'rxjs';
import { RegionController } from 'src/app/database/region/region.controller';
import { Region } from 'src/app/database/region/region.type';
import { BestiaryManagerService } from '../monster/bestiary-manager.service';
import Monster from '../../value-object/monster';
import { roll } from '../../helpers/proba-rolls';

@Injectable({
    providedIn: 'root',
})
export class RegionManagerService {
    regionControllerService = inject(RegionController);
    bestiaryManagerService = inject(BestiaryManagerService);

    private _region$!: BehaviorSubject<Region>;

    get region() {
        return this._region$.value;
    }

    get region$() {
        if (!this._region$) return of(null);
        return this._region$.asObservable();
    }

    get monster() {
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
        return new Monster(monster, isEnchanted);
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
            if (rand <= cumulative) return monsterList[i];
        }
        return monsterList[monsterList.length - 1];
    }
}
