import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  input,
} from '@angular/core';
import { ResourceCollectionService } from 'src/app/core/service/resource-collection-service';
import { MapSceneRenderer } from '../../pixi-components/main/map-scene-renderer';
import { CombatControllerComponent } from './combat-controller/combat-controller.component';
import { MonsterBarComponent } from './monster-bar/monster-bar.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';
import { CombatStore } from 'src/app/core/service/combat/combat.store';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [CombatControllerComponent, MonsterBarComponent, PlayerBarComponent],
  templateUrl: './combat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatComponent implements OnInit {
  private readonly combatStore = inject(CombatStore);
  private readonly resourceCollectionService = inject(
    ResourceCollectionService,
  );

  readonly monsterLife = this.combatStore.monsterLife;
  readonly monsterMaxLife = this.combatStore.monsterMaxLife;
  readonly playerLife = this.combatStore.playerLife;
  readonly playerMaxLife = this.combatStore.playerMaxLife;
  readonly canPlayerAttack = this.combatStore.canPlayerAttack;

  mapSceneRenderer = input<MapSceneRenderer>();

  constructor() {
    effect(() => {
      if (!this.combatStore.shouldMonsterAttack()) {
        return;
      }

      void this.resolveMonsterTurn();
    });
  }

  async ngOnInit(): Promise<void> {
    await this.playCombatIntro();
  }

  leaveCombat(): void {
    this.combatStore.endCombat();
  }

  async attack(): Promise<void> {
    const mapSceneRenderer = this.mapSceneRenderer();

    if (!mapSceneRenderer || !this.combatStore.canPlayerAttack()) {
      return;
    }

    this.combatStore.startTurnResolution();

    try {
      const damage = 1;
      this.combatStore.hitMonster(damage);
      await mapSceneRenderer.playMonsterDamageAnimation(damage);

      if (!this.combatStore.isMonsterAlive()) {
        this.resourceCollectionService.collectActiveTileMonsterResource();
        await mapSceneRenderer.playMonsterDeathAnimation({
          soul: 3,
          glitchedStone: 1,
        });

        this.combatStore.endCombat();
        return;
      }

      this.combatStore.giveTurnToMonster();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  private async playCombatIntro(): Promise<void> {
    const mapSceneRenderer = this.mapSceneRenderer();

    if (!mapSceneRenderer) {
      return;
    }

    this.combatStore.startTurnResolution();

    try {
      await mapSceneRenderer.playCombatIntroAnimation();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  private async resolveMonsterTurn(): Promise<void> {
    const mapSceneRenderer = this.mapSceneRenderer();

    if (!mapSceneRenderer || !this.combatStore.shouldMonsterAttack()) {
      return;
    }

    this.combatStore.startTurnResolution();

    try {
      await this.wait(350);
      const damage = 1;
      await mapSceneRenderer.playMonsterAttackAnimation(damage);
      this.combatStore.hitPlayer(damage);

      if (!this.combatStore.isPlayerAlive()) {
        this.combatStore.endCombat();
        return;
      }

      this.combatStore.giveTurnToPlayer();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  private wait(duration: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
}
