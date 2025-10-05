import { inject, Injectable } from '@angular/core';
import { HumanManagerService } from './player/human-manager.service';
import { RegionManagerService } from './location/region.service';
import { concat, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DebugService {
    humanManagerService = inject(HumanManagerService);
    regionManagerService = inject(RegionManagerService);

    constructor() {
        const cheatOn = this.getBooleanFromStorage(
            localStorage.getItem('cheat')
        );
        if (cheatOn) {
            const cheatArray = [
                this.moreDamage$(),
                this.moreMonster$(),
                this.moreFinding$(),
                this.moreTresorChestMap$(),
                this.deactivateCheat(),
            ];
            concat(...cheatArray).subscribe(() => console.log('cheat done'));
        }
    }

    moreTresorChestMap$() {
        const addTresorMap = localStorage.getItem('tresorMap');
        if (!addTresorMap) return of(null);
        return this.regionManagerService.updateSelectedRegionChestSpawnRate$(
            +addTresorMap
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
