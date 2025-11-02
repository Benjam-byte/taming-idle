import { inject, Injectable } from '@angular/core';
import { HumanManagerService } from './player/human-manager.service';
import { RegionManagerService } from './location/region.service';
import { concat, of } from 'rxjs';
import { LootManagerService } from './player/loot-manager.service';

@Injectable({ providedIn: 'root' })
export class DebugService {
    humanManagerService = inject(HumanManagerService);
    regionManagerService = inject(RegionManagerService);
    lootManagerService = inject(LootManagerService);

    constructor() {
        const cheatOn = this.getBooleanFromStorage(
            localStorage.getItem('cheat')
        );
        if (cheatOn) {
            const cheatArray = [
                this.moreDamage$(),
                this.moreMonster$(),
                this.moreFinding$(),
                this.moreEnchantedWheat$(),
                this.moreEnchantedMonster$(),
                this.moreTresorChestMap$(),
                this.moreEgg$(),
                this.addWheat$(),
                this.addEnchantedWheat$(),
                this.addSoul$(),
                this.addEnchantedSoul$(),
                this.addGlitchedStone$(),
                this.deactivateCheat(),
            ];
            concat(...cheatArray).subscribe(() => console.log('cheat done'));
        }
    }

    addGlitchedStone$() {
        const addStone = localStorage.getItem('stone');
        if (!addStone) return of(null);
        return this.lootManagerService.addGlitchedStone$(+addStone);
    }

    addSoul$() {
        const addSoul = localStorage.getItem('soul');
        if (!addSoul) return of(null);
        return this.lootManagerService.addSoul$(+addSoul);
    }

    addEnchantedSoul$() {
        const addEnchantedSoul = localStorage.getItem('enchantedSoul');
        if (!addEnchantedSoul) return of(null);
        return this.lootManagerService.addEnchantedSoul$(+addEnchantedSoul);
    }

    addWheat$() {
        const addWheat = localStorage.getItem('wheat');
        if (!addWheat) return of(null);
        return this.lootManagerService.addWheat$(+addWheat);
    }

    addEnchantedWheat$() {
        const addEnchantedWheat = localStorage.getItem('enchantedWheat');
        if (!addEnchantedWheat) return of(null);
        return this.lootManagerService.addEnchantedWheat$(+addEnchantedWheat);
    }

    moreEnchantedWheat$() {
        const moreEnchantedWheat = localStorage.getItem('enchantedWheatRate');
        if (!moreEnchantedWheat) return of(null);
        return this.regionManagerService.updateSelectedRegionEnchantedResource$(
            +moreEnchantedWheat
        );
    }

    moreTresorChestMap$() {
        const addTresorMap = localStorage.getItem('tresorMap');
        if (!addTresorMap) return of(null);
        return this.regionManagerService.updateSelectedRegionChestSpawnRate$(
            +addTresorMap
        );
    }

    moreEgg$() {
        const addEggRate = localStorage.getItem('egg');
        if (!addEggRate) return of(null);
        return this.regionManagerService.updateSelectedRegionEggSpawnRate$(
            +addEggRate
        );
    }

    moreFinding$() {
        const addFinding = localStorage.getItem('finding');
        if (!addFinding) return of(null);
        return this.humanManagerService.updateFinding$(+addFinding);
    }

    moreDamage$() {
        const addDamage = localStorage.getItem('damage');
        if (!addDamage) return of(null);
        return this.humanManagerService.updateDamage$(+addDamage);
    }

    moreMonster$() {
        const addMonsterSpanwRate = localStorage.getItem('monster');
        if (!addMonsterSpanwRate) return of(null);
        return this.regionManagerService.updateSelectedRegionMonsterSpawnRate$(
            +addMonsterSpanwRate
        );
    }

    moreEnchantedMonster$() {
        const addEnchantedMonsterRate =
            localStorage.getItem('enchantedMonster');
        if (!addEnchantedMonsterRate) return of(null);
        return this.regionManagerService.updateSelectedRegionEnchantedMonsterRate$(
            +addEnchantedMonsterRate
        );
    }

    deactivateCheat() {
        return of(localStorage.setItem('cheat', 'false'));
    }

    private getBooleanFromStorage(
        value: string | null,
        defaultValue = false
    ): boolean {
        return value === null ? defaultValue : value === 'true';
    }
}
