import { inject, Injectable } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { RegionManagerService } from 'src/app/core/service/location/region.service';
import { AssignedMonsterManagerService } from 'src/app/core/service/player/assigned-monster-manager.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';

@Injectable({
    providedIn: 'root',
})
export class FightFacade {
    clickEffectService = inject(ClickEffectService);
    gameEngineService = inject(GameEngineService);
    regionManager = inject(RegionManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    lootManager = inject(LootManagerService);

    constructor() {}

    fightFromAuto() {
        this.clickEffectService.damageClickEffectFromAuto(
            this.getAdjustedCenterPosition()
        );
        this.gameEngineService.submitEventByType('fight', () => {
            if (!this.regionManager.monster.isAlive) return;
            this.regionManager.monster.getHit(
                this.assignedMonsterManager.damage
            );
            this.assignedMonsterManager
                .xpByProfessionName$('Guerrier')
                .subscribe();
            this.monsterKilled();
        });
    }

    fight(event: MouseEvent) {
        this.clickEffectService.damageClickEffect(event);
        this.gameEngineService.submitEventByType('fight', () => {
            if (!this.regionManager.monster.isAlive) return;
            this.regionManager.monster.getHit(
                this.assignedMonsterManager.damage
            );
            this.assignedMonsterManager
                .xpByProfessionName$('Guerrier')
                .subscribe();
            this.monsterKilled();
        });
    }

    private monsterKilled() {
        if (!this.regionManager.monster.isAlive) {
            this.lootManager.addLootFromMonsterKilled(
                this.regionManager.monster
            );
            this.gameEngineService.submitEventByType('skip');
        }
    }

    private getAdjustedCenterPosition(): { x: number; y: number } {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        return {
            x: centerX - 50,
            y: centerY - 50,
        };
    }
}
