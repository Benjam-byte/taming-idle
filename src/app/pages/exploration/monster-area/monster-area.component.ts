import { Component, inject } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { MonsterSpriteComponent } from 'src/app/core/components/monster-sprite/monster-sprite.component';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { ActionGaugeComponent } from 'src/app/core/components/action-gauge/action-gauge.component';
import { CommonModule } from '@angular/common';
import { RegionManagerService } from 'src/app/core/service/location/region.service';
import { AssignedMonsterManagerService } from 'src/app/core/service/player/assigned-monster-manager.service';
import { FightFacade } from './fight-facade';

@Component({
    selector: 'app-monster-area',
    templateUrl: './monster-area.component.html',
    styleUrls: ['./monster-area.component.scss'],
    imports: [MonsterSpriteComponent, ActionGaugeComponent, CommonModule],
})
export class MonsterAreaComponent {
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    regionManager = inject(RegionManagerService);
    gameEngineService = inject(GameEngineService);
    clickEffectService = inject(ClickEffectService);
    fightFacade = inject(FightFacade);

    monster = this.fightFacade.getMonster();

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
        this.fightFacade.fight(event);
    }
}
