import { inject, Injectable } from '@angular/core';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';
import { Region } from 'src/app/database/region/region.type';
import { RegionManagerService } from './location/region.service';
import { LootManagerService } from './player/loot-manager.service';
import { ProfessionName } from '../enum/profession-name.enum';
import { forkJoin, tap } from 'rxjs';

export type OfflineSnapshot = {
    version: 1;
    savedAt: number;
    assignedMonster: TamedMonster;
    selectedRegion: Region;
};

const LS_KEY = 'offline:snapshot:v1';

@Injectable({
    providedIn: 'root',
})
export class OfflineProgress {
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    regionManager = inject(RegionManagerService);
    lootManager = inject(LootManagerService);

    constructor() {}

    saveSnapshot(): void {
        console.log('saved');
        const snapshot: OfflineSnapshot = {
            version: 1,
            savedAt: Date.now(),
            assignedMonster: this.assignedMonsterManager.assignedMonster,
            selectedRegion: this.regionManager.region,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    }

    restoreFromSnapshot(maxHours = 12):
        | {
              wheat: number;
              enchantedWheat: number;
              soul: number;
              enchantedSoul: number;
              snapshot: OfflineSnapshot;
              xpObject: Record<ProfessionName, number>;
          }
        | undefined {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;

        let snap: OfflineSnapshot | undefined;
        try {
            snap = JSON.parse(raw) as OfflineSnapshot;
        } catch {
            return;
        }
        if (!snap || snap.version !== 1) return;

        const now = Date.now();
        let dtMs = Math.max(0, now - snap.savedAt);
        const maxMs = maxHours * 3600_000;
        if (dtMs > maxMs) dtMs = maxMs;

        if (snap.assignedMonster.monsterSpecies === 'Terra larva')
            return {
                wheat: 0,
                enchantedWheat: 0,
                soul: 0,
                enchantedSoul: 0,
                snapshot: snap,
                xpObject: {
                    [ProfessionName.Voyageur]: 0,
                    [ProfessionName.Guerrier]: 0,
                    [ProfessionName.Fermier]: 0,
                    [ProfessionName.Voleur]: 0,
                    [ProfessionName.Botaniste]: 0,
                    [ProfessionName.Alchimiste]: 0,
                    [ProfessionName.Necromancien]: 0,
                    [ProfessionName.Pisteur]: 0,
                },
            };
        const wheat = this.collectWheat(snap.assignedMonster, dtMs);
        const enchantedWheat = this.collectEnchantedWheat(
            snap.assignedMonster,
            dtMs,
            snap.selectedRegion
        );
        const soul = this.collectSoul(
            snap.assignedMonster,
            dtMs,
            snap.selectedRegion
        );
        const enchantedSoul = this.collectEnchantedSoul(
            snap.assignedMonster,
            dtMs,
            snap.selectedRegion
        );
        const xpObject: Record<ProfessionName, number> = {
            Guerrier: this.xpForGuerrier(snap.assignedMonster, soul),
            Fermier: this.xpForFermier(snap.assignedMonster, wheat),
            Alchimiste: this.xpForAlchimiste(snap.assignedMonster, soul),
            Botaniste: this.xpForBotatniste(
                snap.assignedMonster,
                enchantedWheat
            ),
            Necromancien: this.xpForNecromancien(
                snap.assignedMonster,
                enchantedSoul
            ),
            Pisteur: this.xpForPisteur(
                snap.assignedMonster,
                dtMs,
                snap.selectedRegion
            ),
            Voyageur: this.xpForTraveller(snap.assignedMonster, dtMs),
            Voleur: 0,
        };
        console.log(xpObject);
        return {
            wheat,
            enchantedWheat,
            soul,
            enchantedSoul,
            snapshot: snap,
            xpObject,
        };
    }

    addFromSnapShot$(value: {
        wheat: number;
        enchantedWheat: number;
        soul: number;
        enchantedSoul: number;
        xpObject: Record<ProfessionName, number>;
    }) {
        const professionXpList = Object.entries(value.xpObject)
            .filter(([, xp]) => xp > 0)
            .map(([professionName, xp]) => ({
                professionName: professionName as ProfessionName,
                xpAmount: xp,
            }));
        return forkJoin([
            this.lootManager.addFromSnap$(value),
            this.assignedMonsterManager.xpOffline$(professionXpList),
        ]).pipe(tap(() => this.saveSnapshot()));
    }

    private collectWheat(assignedMonster: TamedMonster, ellapsedTime: number) {
        return Math.floor(ellapsedTime / assignedMonster.travellingSpeed);
    }

    private collectEnchantedWheat(
        assignedMonster: TamedMonster,
        ellapsedTime: number,
        selectedRegion: Region
    ) {
        return Math.floor(
            (ellapsedTime / assignedMonster.travellingSpeed) *
                assignedMonster.gatherEnchantedBonus *
                selectedRegion.enchantedResource
        );
    }

    private collectSoul(
        assignedMonster: TamedMonster,
        ellapsedTime: number,
        selectedRegion: Region
    ) {
        return Math.floor(
            (ellapsedTime / (assignedMonster.travellingSpeed * 0.75)) *
                selectedRegion.monsterSpawnRate
        );
    }

    private collectEnchantedSoul(
        assignedMonster: TamedMonster,
        ellapsedTime: number,
        selectedRegion: Region
    ) {
        return Math.floor(
            (ellapsedTime / (assignedMonster.travellingSpeed * 0.75)) *
                selectedRegion.monsterSpawnRate *
                selectedRegion.enchantedMonsterRate
        );
    }

    private xpForTraveller(
        assignedMonster: TamedMonster,
        ellapsedTime: number
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Voyageur))
            return Math.floor(ellapsedTime / assignedMonster.travellingSpeed);
        return 0;
    }

    private xpForGuerrier(assignedMonster: TamedMonster, soul: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Guerrier))
            return Math.floor(soul * (10 / assignedMonster.damage));
        return 0;
    }

    private xpForFermier(assignedMonster: TamedMonster, wheat: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Fermier))
            return Math.floor(wheat * this.getRandomEffect());
        return 0;
    }

    private xpForBotatniste(
        assignedMonster: TamedMonster,
        Enchantedwheat: number
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Botaniste))
            return Math.floor(Enchantedwheat * this.getRandomEffect());
        return 0;
    }

    private xpForAlchimiste(assignedMonster: TamedMonster, soul: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Alchimiste))
            return Math.floor(soul * this.getRandomEffect());
        return 0;
    }

    private xpForNecromancien(
        assignedMonster: TamedMonster,
        Enchantedsoul: number
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Necromancien))
            return Math.floor(Enchantedsoul * this.getRandomEffect());
        return 0;
    }

    private xpForPisteur(
        assignedMonster: TamedMonster,
        ellapsedTime: number,
        region: Region
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Pisteur)) {
            const monsterScreen =
                (ellapsedTime / assignedMonster.travellingSpeed) *
                region.monsterSpawnRate;
            const chestScreen =
                (ellapsedTime / assignedMonster.travellingSpeed) *
                region.tresorMapSpawnRate;
            return Math.floor(monsterScreen / 3 + chestScreen / 3);
        }
        return 0;
    }

    private hasProfession(
        assignedMonster: TamedMonster,
        professionName: ProfessionName
    ) {
        return assignedMonster.availableProfession
            .map((profession) => profession.name)
            .includes(professionName);
    }

    private getRandomEffect() {
        return Math.max(Math.min(0.7, Math.random()), 0.95);
    }
}
