import { Component, inject } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import Monster from 'src/app/core/value-object/monster';
import { MonsterSpriteComponent } from 'src/app/core/components/monster-sprite/monster-sprite.component';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
import { HumanController } from 'src/app/database/human/human.controller';

@Component({
  selector: 'app-monster-area',
  templateUrl: './monster-area.component.html',
  styleUrls: ['./monster-area.component.scss'],
  imports: [MonsterSpriteComponent],
})
export class MonsterAreaComponent {
  gameEngineService = inject(GameEngineService);
  humanManagerService = inject(HumanManagerService);
  clickEffectService = inject(ClickEffectService);
  monster = new Monster(3, 'slime');

  constructor() {}

  onClick(event: MouseEvent) {
    if (this.monster.isAlive) return;
    this.clickEffectService.spawnClickEffect(event);
    this.gameEngineService.submitEventByType('travel');
  }

  fight(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.clickEffectService.damageClickEffect(event);
    this.gameEngineService.submitEventByType('fight', () => {
      if (!this.monster.isAlive) return;
      this.monster.getHit(this.humanManagerService.human.damage);
      this.monsterKilled();
    });
  }

  private monsterKilled() {
    if (!this.monster.isAlive) {
      this.gameEngineService.submitEventByType('kill');
    }
  }
}
