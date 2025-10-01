import { inject, Injectable } from '@angular/core';
import { HumanManagerService } from './player/human-manager.service';
import { RegionManagerService } from './location/region.service';

@Injectable({ providedIn: 'root' })
export class DebugService {
    humanManagerService = inject(HumanManagerService);
    regionManagerService = inject(RegionManagerService);

    constructor() {
        const cheatOn = this.getBooleanFromStorage(
            localStorage.getItem('cheat')
        );
        if (cheatOn) {
            this.moreDamage();
            this.moreMonster();
        }
    }

    moreDamage() {
        const addDamage = localStorage.getItem('damage');
        if (addDamage) {
            this.humanManagerService.updateDamage(+addDamage);
        }
    }

    moreMonster() {
        const addMonsterSpanwRate = localStorage.getItem('monster');
        if (addMonsterSpanwRate) {
            this.regionManagerService
                .updateSelectedRegionMonsterSpawnRate$(+addMonsterSpanwRate)
                .subscribe();
        }
    }

    private getBooleanFromStorage(
        value: string | null,
        defaultValue = false
    ): boolean {
        return value === null ? defaultValue : value === 'true';
    }
}
