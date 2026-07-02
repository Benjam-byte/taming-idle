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
import type { AttackResolution } from 'src/app/core/service/combat/attack-resolver';
import type { CombatAnimationTarget } from '../../pixi-components/main/combat/combat-animation-renderer';

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
  readonly playerSpecialAttackCharge = this.combatStore.playerSpecialAttackCharge;
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
      const resolution = this.combatStore.resolvePlayerAttack();

      if (!resolution) {
        return;
      }

      await this.playResolutionAnimation(mapSceneRenderer, resolution, {
        target: this.getPlayerAttackAnimationTarget(resolution),
        applyDamage: (damage) => this.combatStore.hitMonster(damage),
        isTargetAlive: () => this.combatStore.isMonsterAlive(),
      });

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
      const resolution = this.combatStore.resolveMonsterAttack();

      if (!resolution) {
        return;
      }

      await this.playResolutionAnimation(mapSceneRenderer, resolution, {
        target: this.getMonsterAttackAnimationTarget(resolution),
        animateMonsterAttack: resolution.animationTarget === 'target',
        applyDamage: (damage) => this.combatStore.hitPlayer(damage),
        isTargetAlive: () => this.combatStore.isPlayerAlive(),
      });

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

  private async playResolutionAnimation(
    mapSceneRenderer: MapSceneRenderer,
    resolution: AttackResolution,
    options: {
      target: CombatAnimationTarget;
      animateMonsterAttack?: boolean;
      applyDamage?: (damage: number) => void;
      isTargetAlive?: () => boolean;
    },
  ): Promise<void> {
    if (resolution.effect !== 'multiple') {
      await mapSceneRenderer.playAttackAnimation({
        target: options.target,
        animation: resolution.animation,
        damage: resolution.damage,
        animateMonsterAttack: options.animateMonsterAttack,
      });

      return;
    }

    for (let hit = 0; hit < resolution.hits; hit++) {
      options.applyDamage?.(resolution.damageByHit);

      await mapSceneRenderer.playAttackAnimation({
        target: options.target,
        animation: resolution.animation,
        damage: resolution.damageByHit,
        animateMonsterAttack: options.animateMonsterAttack,
      });

      if (options.isTargetAlive && !options.isTargetAlive()) {
        return;
      }
    }
  }

  private getPlayerAttackAnimationTarget(
    resolution: AttackResolution,
  ): CombatAnimationTarget {
    return resolution.animationTarget === 'target' ? 'monster' : 'player';
  }

  private getMonsterAttackAnimationTarget(
    resolution: AttackResolution,
  ): CombatAnimationTarget {
    return resolution.animationTarget === 'target' ? 'player' : 'monster';
  }
}
