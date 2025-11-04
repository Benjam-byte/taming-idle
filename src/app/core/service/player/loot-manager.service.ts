import { inject, Injectable } from '@angular/core';
import { LootController } from 'src/app/database/loot/loot.controller';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { Loot } from 'src/app/database/loot/loot.type';
import { RegionManagerService } from '../location/region.service';
import { stochasticRound } from '../../helpers/rounding-function';
import { RelicManagerService } from './relic-manager.service';
import { WorldManagerService } from '../location/world.service';
import { ResourceType } from '../../enum/resource.enum';
import Monster from '../../value-object/monster';
import { roll } from '../../helpers/proba-rolls';
import { AssignedMonsterManagerService } from './assigned-monster-manager.service';

@Injectable({ providedIn: 'root' })
export class LootManagerService {
    lootControllerService = inject(LootController);
    relicManagerService = inject(RelicManagerService);
    worldManagerService = inject(WorldManagerService);
    regionManagerService = inject(RegionManagerService);
    assignedMonsterManagerService = inject(AssignedMonsterManagerService);

    private _loot$!: BehaviorSubject<Loot>;

    updatePaidFunctionListByParameter$: Record<
        string,
        (value: any) => Observable<Loot>
    > = {
        Wheat: (value) => this.paidWheat$(value),
        Enchanted_Wheat: (value) => this.paidEnchantedWheat$(value),
        Soul: (value) => this.paidSoul$(value),
        Enchanted_Soul: (value) => this.paidEnchantedSoul$(value),
    };

    get loot() {
        return this._loot$.value;
    }

    get loot$() {
        if (!this._loot$) return of(null);
        return this._loot$.asObservable();
    }

    init$() {
        return this.lootControllerService.get().pipe(
            tap((loot) => (this._loot$ = new BehaviorSubject(loot))),
            map(() => void 0)
        );
    }

    getResource() {
        const isEnchanted = roll(
            this.regionManagerService.region.enchantedResource
        );
        const quantity = stochasticRound(
            1 * this.regionManagerService.region.resourceQuantity
        );
        if (isEnchanted)
            return {
                resource: 'Enchanted_Wheat',
                quantity: stochasticRound(
                    quantity *
                        this.assignedMonsterManagerService.assignedMonster
                            .gatherEnchantedBonus
                ),
            };
        else
            return {
                resource: 'Wheat',
                quantity: stochasticRound(
                    quantity *
                        this.assignedMonsterManagerService.assignedMonster
                            .gatherNormalBonus
                ),
            };
    }

    getCorrectValueFromRessource$(ressource: string) {
        switch (ressource) {
            case ResourceType.Wheat:
                return this._loot$.pipe(map((loot) => loot.wheatQuantity));
            case ResourceType.EnchantedWheat:
                return this._loot$.pipe(
                    map((loot) => loot.enchantedWheatQuantity)
                );
            case ResourceType.Soul:
                return this._loot$.pipe(map((loot) => loot.soul));
            case ResourceType.EnchantedSoul:
                return this._loot$.pipe(map((loot) => loot.enchantedSoul));
            default:
                return this._loot$.pipe(map((loot) => loot.wheatQuantity));
        }
    }

    addLootFromMonsterKilled(monster: Monster) {
        if (monster.isEnchanted) {
            this.assignedMonsterManagerService
                .xpByProfessionName$('Necromancien')
                .subscribe();
            this.lootControllerService
                .update(this.loot.id, {
                    enchantedSoul:
                        Math.floor(
                            1 *
                                this.assignedMonsterManagerService
                                    .assignedMonster.lootEnchantedBonus
                        ) + this.loot.enchantedSoul, //add %
                })
                .subscribe((loot) => {
                    this._loot$.next(loot);
                });
        } else {
            this.assignedMonsterManagerService
                .xpByProfessionName$('Alchimiste')
                .subscribe();
            this.lootControllerService
                .update(this.loot.id, {
                    soul:
                        Math.floor(
                            1 *
                                this.assignedMonsterManagerService
                                    .assignedMonster.lootNormalBonus
                        ) + this.loot.soul, //add %
                })
                .subscribe((loot) => {
                    this._loot$.next(loot);
                });
        }
    }

    addFromSnap$(value: {
        wheat: number;
        enchantedWheat: number;
        soul: number;
        enchantedSoul: number;
    }): Observable<Loot> {
        return this.lootControllerService
            .update(this.loot.id, {
                soul: value.soul + this.loot.soul,
                enchantedSoul: value.enchantedSoul + this.loot.enchantedSoul,
                wheatQuantity: value.wheat + this.loot.wheatQuantity,
                enchantedWheatQuantity:
                    value.enchantedWheat + this.loot.enchantedWheatQuantity,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    addGlitchedStone$(value: number): Observable<Loot> {
        return this.lootControllerService
            .update(this.loot.id, {
                glitchedStone: value + this.loot.glitchedStone,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    addSoul$(value: number): Observable<Loot> {
        this.assignedMonsterManagerService
            .xpByProfessionName$('Alchimiste')
            .subscribe();
        return this.lootControllerService
            .update(this.loot.id, {
                soul: value + this.loot.soul,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    addEnchantedSoul$(value: number): Observable<Loot> {
        this.assignedMonsterManagerService
            .xpByProfessionName$('Necromancien')
            .subscribe();
        return this.lootControllerService
            .update(this.loot.id, {
                enchantedSoul: value + this.loot.enchantedSoul,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    addWheat$(value: number) {
        this.assignedMonsterManagerService
            .xpByProfessionName$('Fermier')
            .subscribe();
        return this.lootControllerService
            .update(this.loot.id, {
                wheatQuantity: value + this.loot.wheatQuantity,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    addEnchantedWheat$(value: number) {
        this.assignedMonsterManagerService
            .xpByProfessionName$('Botaniste')
            .subscribe();
        return this.lootControllerService
            .update(this.loot.id, {
                enchantedWheatQuantity:
                    value + this.loot.enchantedWheatQuantity,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    paidWheat$(wheat: number): Observable<Loot> {
        if (this.loot.wheatQuantity - wheat < 0)
            throw new Error('not enough money');
        return this.lootControllerService
            .update(this.loot.id, {
                wheatQuantity: this.loot.wheatQuantity - wheat,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    paidGlitchedStone$(stone: number): Observable<Loot> {
        if (this.loot.glitchedStone - stone < 0)
            throw new Error('not enough stone');
        return this.lootControllerService
            .update(this.loot.id, {
                glitchedStone: this.loot.glitchedStone - stone,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    paidEnchantedWheat$(wheat: number) {
        if (this.loot.enchantedWheatQuantity - wheat < 0)
            throw new Error('not enough money');
        return this.lootControllerService
            .update(this.loot.id, {
                enchantedWheatQuantity:
                    this.loot.enchantedWheatQuantity - wheat,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    paidEnchantedSoul$(shinnySoul: number) {
        if (this.loot.enchantedSoul - shinnySoul < 0)
            throw new Error('not enough money');
        return this.lootControllerService
            .update(this.loot.id, {
                enchantedSoul: this.loot.enchantedSoul - shinnySoul,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    paidSoul$(soul: number) {
        if (this.loot.soul - soul < 0) throw new Error('not enough money');
        return this.lootControllerService
            .update(this.loot.id, {
                soul: this.loot.soul - soul,
            })
            .pipe(tap((loot) => this._loot$.next(loot)));
    }

    updateChestCount() {
        this.lootControllerService
            .update(this.loot.id, {
                openedChest: this.loot.openedChest + 1,
            })
            .subscribe((loot) => this._loot$.next(loot));
    }

    lootChest(loot: string): string {
        if (!this.worldManagerService.world.metaGodAvailable)
            loot = 'relicRank1';
        this.updateChestCount();
        switch (loot) {
            case 'relicRank1': {
                const newRelic =
                    this.relicManagerService.getOneRelicRandomByRank(1);
                this.relicManagerService.addOneRelicByName(newRelic.name, null);
                this.worldManagerService.firstRelicOpened();
                return newRelic.name;
            }
            case 'glitchedStone':
                this.addGlitchedStone$(2).subscribe();
                return '2 glitched stone';
        }
        return 'une erreur avec ce coffre';
    }
}
