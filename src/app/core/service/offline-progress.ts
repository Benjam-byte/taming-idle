import { inject, Injectable } from '@angular/core';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';
import { Region } from 'src/app/database/region/region.type';
import { RegionManagerService } from './location/region.service';
import { LootManagerService } from './player/loot-manager.service';

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
        const snapshot: OfflineSnapshot = {
            version: 1,
            savedAt: Date.now(),
            assignedMonster: this.assignedMonsterManager.assignedMonster,
            selectedRegion: this.regionManager.region,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    }

    restoreFromSnapshot(maxHours = 12) {
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
        return { wheat, enchantedWheat, soul, enchantedSoul, snapshot: snap };
    }

    addFromSnapShot$(value: {
        wheat: number;
        enchantedWheat: number;
        soul: number;
        enchantedSoul: number;
    }) {
        this.lootManager.addFromSnap$(value).subscribe();
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
}
