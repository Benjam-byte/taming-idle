import { AnimatedSprite, Application, Container } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { AnimationQueue } from 'src/app/core/service/combat/animation-queue';
import { TickerAnimationRunner } from '../utils/ticker-animation-runner';
import { DropType, MonsterDropReward } from '../map-scene-renderer.types';
import { CombatAnimationRenderer } from './combat-animation-renderer';
import { DropRenderer } from './drop-renderer';

export type CombatSceneMonsterAccess = {
  getMonsterSprite: () => AnimatedSprite | undefined;
  isMonsterDying: () => boolean;
  takeMonsterForDeath: () => AnimatedSprite | undefined;
  finishMonsterDeath: () => void;
};

export class CombatSceneRenderer {
  private readonly animationQueue = new AnimationQueue();
  private readonly combatAnimationRenderer: CombatAnimationRenderer;
  private readonly dropRenderer: DropRenderer;

  constructor(
    game: Application,
    sceneContainer: Container,
    pixiAssetService: PixiAssetService,
    animationRunner: TickerAnimationRunner,
    private readonly monsterAccess: CombatSceneMonsterAccess,
    onDropClick: (dropType: DropType) => void,
  ) {
    this.combatAnimationRenderer = new CombatAnimationRenderer(
      game,
      sceneContainer,
      animationRunner,
    );

    this.dropRenderer = new DropRenderer(
      animationRunner,
      sceneContainer,
      pixiAssetService,
      onDropClick,
    );
  }

  get isAnimating(): boolean {
    return this.animationQueue.isPlaying;
  }

  clearDrops(): void {
    this.dropRenderer.clearActiveDrops();
  }

  destroy(): void {
    this.combatAnimationRenderer.destroy();
    this.dropRenderer.destroy();
  }

  playMonsterDamageAnimation(damage: number): Promise<void> {
    return this.animationQueue.enqueue(() => {
      return this.combatAnimationRenderer.playMonsterDamageAnimation(
        this.monsterAccess.getMonsterSprite(),
        damage,
      );
    });
  }

  playMonsterAttackAnimation(damage: number): Promise<void> {
    return this.animationQueue.enqueue(() => {
      return this.combatAnimationRenderer.playMonsterAttackAnimation(
        this.monsterAccess.getMonsterSprite(),
        damage,
      );
    });
  }

  playCombatIntroAnimation(): Promise<void> {
    return this.animationQueue.enqueue(() => {
      return this.combatAnimationRenderer.playCombatIntroAnimation(
        this.monsterAccess.getMonsterSprite(),
      );
    });
  }

  playMonsterDeathAnimation(
    reward: MonsterDropReward = {},
    onComplete?: () => void,
  ): Promise<void> {
    return this.animationQueue.enqueue(async () => {
      if (this.monsterAccess.isMonsterDying()) {
        return;
      }

      const monster = this.monsterAccess.takeMonsterForDeath();

      if (!monster) {
        onComplete?.();
        return;
      }

      const dropOrigin = {
        x: monster.x,
        y: monster.y,
      };

      try {
        await this.combatAnimationRenderer.playMonsterDeathEffect(monster);
        await this.dropRenderer.playMonsterDropAnimation(
          dropOrigin.x,
          dropOrigin.y,
          reward,
        );
      } finally {
        this.monsterAccess.finishMonsterDeath();
      }

      onComplete?.();
    });
  }
}
