import { inject, Injectable } from '@angular/core';
import { ProfessionManagerService } from './profession-manager.service';
import { LootController } from 'src/app/database/loot/loot.controller';
import { BehaviorSubject, map, of, tap } from 'rxjs';
import { Loot } from 'src/app/database/loot/loot.type';
import { RegionManagerService } from '../location/region.service';
import { rateLinear } from '../../helpers/percentage';
import { stochasticRound } from '../../helpers/rounding-function';
import { RelicManagerService } from './relic-manager.service';
import { WorldManagerService } from '../location/world.service';
import { ResourceType } from '../../enum/resource.enum';

@Injectable({ providedIn: 'root' })
export class LootManagerService {
    lootControllerService = inject(LootController);
    relicManagerService = inject(RelicManagerService);
    professionManagerService = inject(ProfessionManagerService);
    worldManagerService = inject(WorldManagerService);
    regionManagerService = inject(RegionManagerService);

    private _loot$!: BehaviorSubject<Loot>;

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

    getLootValue() {
        return stochasticRound(
            rateLinear(
                1,
                this.regionManagerService.region.monsterResourceQuantity
            )
        );
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

    addLootFromMonsterKilled(type: string, lootObject: Record<string, number>) {
        switch (type) {
            case 'slime':
                this.lootControllerService
                    .update(this.loot.id, {
                        soul: 1 + this.loot.soul,
                        enchantedSoul: 1 + this.loot.enchantedSoul,
                    })
                    .subscribe((loot) => {
                        this._loot$.next(loot);
                    });
                break;
        }
    }

    addWheat(wheat: number) {
        this.lootControllerService
            .update(this.loot.id, {
                wheatQuantity: wheat + this.loot.wheatQuantity,
            })
            .subscribe((loot) => {
                this._loot$.next(loot);
                this.professionManagerService.updateByProfessionName('Fermier');
            });
    }

    paidWheat$(wheat: number) {
        if (this.loot.wheatQuantity - wheat < 0) return;
        return this.lootControllerService
            .update(this.loot.id, {
                wheatQuantity: this.loot.wheatQuantity - wheat,
            })
            .pipe(
                tap((loot) => {
                    this._loot$.next(loot);
                })
            );
    }

    paidEnchantedWheat$(wheat: number) {
        if (this.loot.enchantedWheatQuantity - wheat < 0) return;
        return this.lootControllerService
            .update(this.loot.id, {
                enchantedWheatQuantity:
                    this.loot.enchantedWheatQuantity - wheat,
            })
            .pipe(
                tap((loot) => {
                    this._loot$.next(loot);
                })
            );
    }

    paidEnchantedSoul$(shinnySoul: number) {
        if (this.loot.enchantedSoul - shinnySoul < 0) return;
        return this.lootControllerService
            .update(this.loot.id, {
                enchantedSoul: this.loot.enchantedSoul - shinnySoul,
            })
            .pipe(
                tap((loot) => {
                    this._loot$.next(loot);
                })
            );
    }

    paidSoul$(soul: number) {
        if (this.loot.soul - soul < 0) return;
        return this.lootControllerService
            .update(this.loot.id, {
                soul: this.loot.soul - soul,
            })
            .pipe(
                tap((loot) => {
                    this._loot$.next(loot);
                })
            );
    }

    updateChestCount() {
        this.lootControllerService
            .update(this.loot.id, {
                openedChest: this.loot.openedChest + 1,
            })
            .subscribe((loot) => {
                this._loot$.next(loot);
            });
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
                return '1 glitched stone';
        }
        return 'une erreur avec ce coffre';
    }
}
