import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  input,
} from '@angular/core';
import { ResourceCollectionService } from 'src/app/core/service/resource-collection-service';
import { CombatService } from 'src/app/core/service/combat/combat-service';
import { MapRenderer } from '../pixi-components/map-renderer';
import { CombatControllerComponent } from './combat-controller/combat-controller.component';
import { MonsterBarComponent } from './monster-bar/monster-bar.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CombatControllerComponent, MonsterBarComponent, PlayerBarComponent],
  templateUrl: './combat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatComponent implements OnInit {
  readonly combatService = inject(CombatService);
  private readonly resourceCollectionService = inject(
    ResourceCollectionService,
  );

  mapRenderer = input<MapRenderer>();

  constructor() {
    effect(() => {
      if (!this.combatService.shouldMonsterAttack()) {
        return;
      }

      void this.resolveMonsterTurn();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.playCombatIntro();
  }

  leaveCombat(): void {
    this.combatService.endCombat();
  }

  async attack(): Promise<void> {
    const mapRenderer = this.mapRenderer();

    if (!mapRenderer || !this.combatService.canPlayerAttack()) {
      return;
    }

    this.combatService.startTurnResolution();

    try {
      const damage = 1;
      this.combatService.hitMonster(damage);
      await mapRenderer.playMonsterDamageAnimation(damage);

      if (!this.combatService.isMonsterAlive()) {
        this.resourceCollectionService.collectActiveTileMonsterResource();
        await mapRenderer.playMonsterDeathAnimation({
          soul: 3,
          glitchedStone: 1,
        });

        this.combatService.endCombat();
        return;
      }

      this.combatService.giveTurnToMonster();
    } finally {
      this.combatService.endTurnResolution();
    }
  }

  private async playCombatIntro(): Promise<void> {
    const mapRenderer = this.mapRenderer();

    if (!mapRenderer) {
      return;
    }

    this.combatService.startTurnResolution();

    try {
      await mapRenderer.playCombatIntroAnimation();
    } finally {
      this.combatService.endTurnResolution();
    }
  }

  private async resolveMonsterTurn(): Promise<void> {
    const mapRenderer = this.mapRenderer();

    if (!mapRenderer || !this.combatService.shouldMonsterAttack()) {
      return;
    }

    this.combatService.startTurnResolution();

    try {
      await this.wait(350);
      const damage = 1;
      await mapRenderer.playMonsterAttackAnimation(damage);
      this.combatService.hitPlayer(damage);

      if (!this.combatService.isPlayerAlive()) {
        this.combatService.endCombat();
        return;
      }

      this.combatService.giveTurnToPlayer();
    } finally {
      this.combatService.endTurnResolution();
    }
  }

  private wait(duration: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}
