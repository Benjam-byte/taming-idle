import { Component, inject } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import Monster from 'src/app/core/value-object/monster';
import { MonsterSpriteComponent } from 'src/app/core/components/monster-sprite/monster-sprite.component';

@Component({
  selector: 'app-monster-area',
  templateUrl: './monster-area.component.html',
  styleUrls: ['./monster-area.component.scss'],
  imports: [MonsterSpriteComponent],
})
export class MonsterAreaComponent {
  gameEngineService = inject(GameEngineService);
  clickEffectService = inject(ClickEffectService);
  monster = new Monster(3, 'slime');

  constructor() {}

  onClick(event: MouseEvent) {
    this.clickEffectService.spawnClickEffect(event);
    this.gameEngineService.submitEventByType('fight', () => {
      if (!this.monster.isAlive) return;
      this.monster.getHit(this.gameEngineService.human().damage);
      this.monsterKilled();
    });
  }

  private monsterKilled() {
    if (!this.monster.isAlive) {
      this.gameEngineService.submitEventByType('kill');
      this.gameEngineService.human().receiveLoot(this.monster.loot.copper);
    }
  }
}
