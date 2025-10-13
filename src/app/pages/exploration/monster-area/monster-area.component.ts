import { Component, inject } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { MonsterSpriteComponent } from 'src/app/core/components/monster-sprite/monster-sprite.component';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
import { ProfessionManagerService } from 'src/app/core/service/player/profession-manager.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { ActionGaugeComponent } from 'src/app/core/components/action-gauge/action-gauge.component';
import { CommonModule } from '@angular/common';
import { RegionManagerService } from 'src/app/core/service/location/region.service';

@Component({
    selector: 'app-monster-area',
    templateUrl: './monster-area.component.html',
    styleUrls: ['./monster-area.component.scss'],
    imports: [MonsterSpriteComponent, ActionGaugeComponent, CommonModule],
})
export class MonsterAreaComponent {
    gameEngineService = inject(GameEngineService);
    professionManagerService = inject(ProfessionManagerService);
    humanManagerService = inject(HumanManagerService);
    lootManagerService = inject(LootManagerService);
    regionManagerService = inject(RegionManagerService);
    clickEffectService = inject(ClickEffectService);

    monster = this.regionManagerService.monster;

    fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

    constructor() {}

    onClick(event: MouseEvent) {
        if (this.monster.isAlive) return;
        this.clickEffectService.spawnClickEffect(event);
        this.gameEngineService.submitEventByType('skip');
    }

    fight(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.clickEffectService.damageClickEffect(event);
        this.gameEngineService.submitEventByType('fight', () => {
            if (!this.monster.isAlive) return;
            this.monster.getHit(this.humanManagerService.damage);
            this.professionManagerService.updateByProfessionName('Guerrier');
            this.monsterKilled();
        });
    }

    private monsterKilled() {
        if (!this.monster.isAlive) {
            this.lootManagerService.addLootFromMonsterKilled(this.monster);
            this.gameEngineService.submitEventByType('skip');
        }
    }
}
