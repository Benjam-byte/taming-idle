import { inject, Injectable } from '@angular/core';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';
import { Region } from 'src/app/database/region/region.type';
import { RegionManagerService } from './location/region.service';
import { LootManagerService } from './player/loot-manager.service';
import { ProfessionName } from '../enum/profession-name.enum';
import { BehaviorSubject, forkJoin, map, tap } from 'rxjs';
import { probabilityAtLeastOneEvent } from '../helpers/proba-rolls';
import { EggManagerService } from './monster/egg-manager.service';
import { WorldManagerService } from './location/world.service';
import { OfflineProgressController } from 'src/app/database/offlineProgress/offline-progress.controller';
import { OfflineValueProgress } from 'src/app/database/offlineProgress/offline-progress.type';

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
    offlineProgressController = inject(OfflineProgressController);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    regionManager = inject(RegionManagerService);
    eggManager = inject(EggManagerService);
    lootManager = inject(LootManagerService);
    worldManager = inject(WorldManagerService);

    private _offlineValueProgress$!: BehaviorSubject<OfflineValueProgress>;

    get offlineValueProgress() {
        return this._offlineValueProgress$.value;
    }

    get OfflineProgress$() {
        return this._offlineValueProgress$.asObservable();
    }

    init$() {
        return this.offlineProgressController.get().pipe(
            tap(
                (offlineValueProgress) =>
                    (this._offlineValueProgress$ = new BehaviorSubject(
                        offlineValueProgress
                    ))
            ),
            map(() => void 0)
        );
    }

    saveSnapshot(): void {
        const snapshot: OfflineSnapshot = {
            version: 1,
            savedAt: Date.now(),
            assignedMonster: this.assignedMonsterManager.assignedMonster,
            selectedRegion: this.regionManager.region,
        };
        localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    }

    cleanSnapshot() {
        localStorage.removeItem(LS_KEY);
    }

    hasSnapshot() {
        return localStorage.getItem(LS_KEY) !== null;
    }

    restoreFromSnapshot(maxHours = 12):
        | {
              wheat: number;
              enchantedWheat: number;
              soul: number;
              enchantedSoul: number;
              egg: number;
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
                egg: 0,
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
        const availableProfessionNameList =
            snap.assignedMonster.availableProfession.reduce(
                (acc, profession) => {
                    acc.add(profession.name);
                    return acc;
                },
                new Set<ProfessionName>()
            );
        const wheat = availableProfessionNameList.has(ProfessionName.Fermier)
            ? this.collectWheat(snap.assignedMonster, dtMs)
            : 0;
        const enchantedWheat = availableProfessionNameList.has(
            ProfessionName.Botaniste
        )
            ? this.collectEnchantedWheat(
                  snap.assignedMonster,
                  dtMs,
                  snap.selectedRegion
              )
            : 0;
        const soul = availableProfessionNameList.has(ProfessionName.Alchimiste)
            ? this.collectSoul(snap.assignedMonster, dtMs, snap.selectedRegion)
            : 0;
        const enchantedSoul = availableProfessionNameList.has(
            ProfessionName.Necromancien
        )
            ? this.collectEnchantedSoul(
                  snap.assignedMonster,
                  dtMs,
                  snap.selectedRegion
              )
            : 0;
        const egg = this.collectEgg(
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
        return {
            wheat,
            enchantedWheat,
            soul,
            enchantedSoul,
            egg,
            snapshot: snap,
            xpObject,
        };
    }

    addFromSnapShot$(value: {
        wheat: number;
        enchantedWheat: number;
        soul: number;
        enchantedSoul: number;
        egg: number;
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
            this.eggManager.addOneEggFromSnap$(value.egg),
            this.assignedMonsterManager.xpOffline$(professionXpList),
        ]).pipe(tap(() => this.saveSnapshot()));
    }

    updateEggProgress$(remainder: number) {
        return this.offlineProgressController
            .update(this.offlineValueProgress.id, { eggProgress: remainder })
            .pipe(
                tap((offlineValueProgress) =>
                    this._offlineValueProgress$.next(offlineValueProgress)
                )
            );
    }

    private collectWheat(assignedMonster: TamedMonster, elapsedTime: number) {
        return Math.floor(
            (elapsedTime / (assignedMonster.travellingSpeed * 1.75)) *
                this.worldManager.world.offlinePower
        );
    }

    private collectEnchantedWheat(
        assignedMonster: TamedMonster,
        elapsedTime: number,
        selectedRegion: Region
    ) {
        return Math.floor(
            (elapsedTime / (assignedMonster.travellingSpeed * 1.75)) *
                assignedMonster.gatherEnchantedBonus *
                selectedRegion.enchantedResource *
                this.worldManager.world.offlinePower
        );
    }

    private collectSoul(
        assignedMonster: TamedMonster,
        elapsedTime: number,
        selectedRegion: Region
    ) {
        return Math.floor(
            (elapsedTime / (assignedMonster.travellingSpeed * 1.75)) *
                selectedRegion.monsterSpawnRate *
                this.worldManager.world.offlinePower
        );
    }

    private collectEgg(
        assignedMonster: TamedMonster,
        elapsedTime: number,
        selectedRegion: Region
    ) {
        const interval = assignedMonster.travellingSpeed * 1.75;
        const n = Math.max(0, Math.floor(elapsedTime / interval));
        const expected = n * selectedRegion.eggSpawnRate;

        const prev = this.offlineValueProgress.eggProgress ?? 0;
        const total = prev + expected;

        const eggs = Math.floor(total);
        const remainder = total - eggs;

        this.updateEggProgress$(remainder).subscribe();

        return eggs;
    }

    private collectEnchantedSoul(
        assignedMonster: TamedMonster,
        elapsedTime: number,
        selectedRegion: Region
    ) {
        return Math.floor(
            (elapsedTime / (assignedMonster.travellingSpeed * 1.75)) *
                selectedRegion.monsterSpawnRate *
                selectedRegion.enchantedMonsterRate *
                this.worldManager.world.offlinePower
        );
    }

    private xpForTraveller(assignedMonster: TamedMonster, elapsedTime: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Voyageur))
            return Math.floor(
                (elapsedTime / assignedMonster.travellingSpeed) *
                    this.worldManager.world.xpBoost
            );
        return 0;
    }

    private xpForGuerrier(assignedMonster: TamedMonster, soul: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Guerrier))
            return Math.floor(
                soul *
                    (10 / assignedMonster.damage) *
                    this.worldManager.world.xpBoost
            );
        return 0;
    }

    private xpForFermier(assignedMonster: TamedMonster, wheat: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Fermier))
            return Math.floor(
                wheat * this.getRandomEffect() * this.worldManager.world.xpBoost
            );
        return 0;
    }

    private xpForBotatniste(
        assignedMonster: TamedMonster,
        Enchantedwheat: number
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Botaniste))
            return Math.floor(
                Enchantedwheat *
                    this.getRandomEffect() *
                    this.worldManager.world.xpBoost
            );
        return 0;
    }

    private xpForAlchimiste(assignedMonster: TamedMonster, soul: number) {
        if (this.hasProfession(assignedMonster, ProfessionName.Alchimiste))
            return Math.floor(
                soul * this.getRandomEffect() * this.worldManager.world.xpBoost
            );
        return 0;
    }

    private xpForNecromancien(
        assignedMonster: TamedMonster,
        Enchantedsoul: number
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Necromancien))
            return Math.floor(
                Enchantedsoul *
                    this.getRandomEffect() *
                    this.worldManager.world.xpBoost
            );
        return 0;
    }

    private xpForPisteur(
        assignedMonster: TamedMonster,
        elapsedTime: number,
        region: Region
    ) {
        if (this.hasProfession(assignedMonster, ProfessionName.Pisteur)) {
            const monsterScreen =
                (elapsedTime / assignedMonster.travellingSpeed) *
                region.monsterSpawnRate;
            const chestScreen =
                (elapsedTime / assignedMonster.travellingSpeed) *
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
