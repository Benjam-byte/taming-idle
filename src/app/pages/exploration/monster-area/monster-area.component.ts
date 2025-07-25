import { Component, inject } from '@angular/core';
import { auditTime, Subject } from 'rxjs';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import Monster from 'src/app/core/value-object/monster';

@Component({
  selector: 'app-monster-area',
  templateUrl: './monster-area.component.html',
  styleUrls: ['./monster-area.component.scss'],
})
export class MonsterAreaComponent {
  gameEngineService = inject(GameEngineService);
  monster = new Monster(3, 'slime');
  private readonly clickSubject = new Subject<void>();

  constructor() {
    this.clickSubject
      .pipe(auditTime(this.gameEngineService.human().fightingSpeed))
      .subscribe(() => {
        this.handleClick();
      });
  }

  onClick() {
    this.clickSubject.next();
  }

  private handleClick() {
    this.monster.getHit(this.gameEngineService.human().damage);
    if (!this.monster.isAlive) this.changeMap();
  }

  private changeMap() {
    this.gameEngineService.switchMap();
  }
}
