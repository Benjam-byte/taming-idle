import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  input,
} from '@angular/core';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';
import { ResourceCollectionService } from 'src/app/core/service/resource-collection-service';
import { MapSceneRenderer } from '../../pixi-components/main/map-scene-renderer';
import { CombatControllerComponent } from './combat-controller/combat-controller.component';
import { CombatStore } from 'src/app/core/service/combat/combat.store';
import type {
  AttackResolution,
} from 'src/app/core/service/combat/attack-resolver';
import type { CombatWaveCompletion } from 'src/app/core/service/combat/combat.store';
import type { CombatAnimationTarget } from '../../pixi-components/main/combat/combat-animation-renderer';
import { BurrowStore } from 'src/app/core/service/burrow/burrow.store';
import { MonsterStore } from 'src/app/core/service/monster/monster.store';
import { TurnOrderComponent } from './turn-order/turn-order.component';

@Component({
  selector: 'app-combat',
  standalone: true,
  imports: [
    CombatControllerComponent,
    IconButtonComponent,
    TurnOrderComponent,
  ],
  templateUrl: './combat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CombatComponent implements OnInit {
  private readonly combatStore = inject(CombatStore);
  private readonly resourceCollectionService = inject(
    ResourceCollectionService,
  );
  private readonly burrowStore = inject(BurrowStore);
  private readonly monsterStore = inject(MonsterStore);

  readonly monsterLife = this.combatStore.monsterLife;
  readonly monsterMaxLife = this.combatStore.monsterMaxLife;
  readonly playerLife = this.combatStore.playerLife;
  readonly playerMaxLife = this.combatStore.playerMaxLife;
  readonly playerSpecialAttackCharge = this.combatStore.playerSpecialAttackCharge;
  readonly canPlayerAttack = this.combatStore.canPlayerAttack;
  readonly isTurnResolving = this.combatStore.isTurnResolving;
  readonly upcomingTurns = this.combatStore.upcomingTurns;

  mapSceneRenderer = input<MapSceneRenderer>();

  constructor() {
    effect(() => {
      if (!this.combatStore.shouldMonsterAttack()) {
        return;
      }

      void this.resolveMonsterTurn();
    });

    effect(() => {
      this.mapSceneRenderer()?.setCombatHealthBars({
        monster: {
          current: this.monsterLife(),
          max: this.monsterMaxLife(),
        },
        player: {
          current: this.playerLife(),
          max: this.playerMaxLife(),
        },
      });
    });
  }

  async ngOnInit(): Promise<void> {
    await this.playCombatIntro();
  }

  leaveCombat(): void {
    if (this.combatStore.isTurnResolving()) {
      return;
    }

    const isBurrowCombat = this.combatStore.isBurrowCombat();
    this.combatStore.endCombat();

    if (isBurrowCombat) {
      this.burrowStore.abort();
    }
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
        animatePlayerAttack: resolution.kind === 'base',
        applyDamage: (damage) => this.combatStore.hitMonster(damage),
        isTargetAlive: () => this.combatStore.isMonsterAlive(),
      });

      if (!this.combatStore.isMonsterAlive()) {
        await this.resolveEnemyDefeat(mapSceneRenderer);
        return;
      }

      this.combatStore.giveTurnToMonster();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  async tame(): Promise<void> {
    const mapSceneRenderer = this.mapSceneRenderer();

    if (!mapSceneRenderer || !this.combatStore.canPlayerAttack()) {
      return;
    }

    const monster = this.combatStore.monster()?.monster;

    if (!monster) {
      return;
    }

    this.combatStore.startTurnResolution();

    try {
      this.monsterStore.tame(monster);
      await this.resolveEnemyCapture(mapSceneRenderer);
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
        const isBurrowCombat = this.combatStore.isBurrowCombat();
        this.combatStore.endCombat();

        if (isBurrowCombat) {
          this.burrowStore.abort();
        }
        return;
      }

      this.combatStore.giveTurnToPlayer();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  private async resolveEnemyDefeat(
    mapSceneRenderer: MapSceneRenderer,
  ): Promise<void> {
    await this.finishCurrentEnemy(mapSceneRenderer, () =>
      this.combatStore.recordCurrentEnemyDefeat(),
    );
  }

  private async resolveEnemyCapture(
    mapSceneRenderer: MapSceneRenderer,
  ): Promise<void> {
    await this.finishCurrentEnemy(mapSceneRenderer, () =>
      this.combatStore.recordCurrentEnemyTamed(),
    );
  }

  private async finishCurrentEnemy(
    mapSceneRenderer: MapSceneRenderer,
    record: () => CombatWaveCompletion | null,
  ): Promise<void> {
    const isBurrowCombat = this.combatStore.isBurrowCombat();
    const completion = record();

    if (!completion) {
      this.abortCombat(isBurrowCombat);
      return;
    }

    if (isBurrowCombat) {
      this.burrowStore.recordEnemyDefeated();
    }

    await mapSceneRenderer.playMonsterDeathAnimation(
      completion.encounterComplete ? completion.reward : {},
    );

    if (!completion.encounterComplete) {
      if (!this.combatStore.startNextEnemy()) {
        this.abortCombat(isBurrowCombat);
        return;
      }

      mapSceneRenderer.showCombatMonster();
      await mapSceneRenderer.playCombatIntroAnimation();
      return;
    }

    if (isBurrowCombat) {
      this.burrowStore.complete();
    } else {
      this.resourceCollectionService.collectActiveTileMonsterResource();
    }

    this.combatStore.endCombat();
  }

  private abortCombat(isBurrowCombat: boolean): void {
    this.combatStore.endCombat();

    if (isBurrowCombat) {
      this.burrowStore.abort();
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
      animatePlayerAttack?: boolean;
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
        animatePlayerAttack: options.animatePlayerAttack,
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
        animatePlayerAttack: options.animatePlayerAttack,
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
