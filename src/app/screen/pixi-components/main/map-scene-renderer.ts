import { Application, Container } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';
import { Coordinate } from 'src/app/core/type/coordinate';
import { TickerAnimationRunner } from './utils/ticker-animation-runner';
import { CombatSceneRenderer } from './combat/combat-scene-renderer';
import { ExplorationSceneRenderer } from './exploration/exploration-scene-renderer';
import { DropType, MonsterDropReward } from './map-scene-renderer.types';

export type { MonsterDropReward } from './map-scene-renderer.types';

type PerformanceMemory = {
  usedJSHeapSize: number;
};

export class MapSceneRenderer {
  private readonly sceneContainer = new Container();
  private readonly animationRunner: TickerAnimationRunner;
  private readonly explorationSceneRenderer: ExplorationSceneRenderer;
  private readonly combatSceneRenderer: CombatSceneRenderer;

  private perfInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    pixiAssetService: PixiAssetService,
    onResourceClick: (coordinate: Coordinate) => void,
    onMonsterClick: () => void,
    onDropClick: (dropType: DropType) => void,
  ) {
    this.animationRunner = new TickerAnimationRunner(this.game);

    this.explorationSceneRenderer = new ExplorationSceneRenderer(
      this.game,
      this.sceneContainer,
      pixiAssetService,
      this.animationRunner,
      () => !this.isAnimating,
      onResourceClick,
      onMonsterClick,
    );

    this.combatSceneRenderer = new CombatSceneRenderer(
      this.game,
      this.sceneContainer,
      pixiAssetService,
      this.animationRunner,
      {
        getMonsterSprite: () => this.explorationSceneRenderer.monsterSprite,
        isMonsterDying: () => this.explorationSceneRenderer.isMonsterDying,
        takeMonsterForDeath: () =>
          this.explorationSceneRenderer.takeMonsterForDeath(),
        finishMonsterDeath: () =>
          this.explorationSceneRenderer.finishMonsterDeath(),
      },
      onDropClick,
    );
  }

  public get isAnimating(): boolean {
    return this.combatSceneRenderer.isAnimating;
  }

  init(): void {
    this.sceneContainer.label = 'mapSceneContainer';
    this.sceneContainer.sortableChildren = true;

    this.container.addChild(this.sceneContainer);

    this.explorationSceneRenderer.init();
    this.startPerfLogs();
  }

  render(tile: Tile): void {
    const renderResult = this.explorationSceneRenderer.render(tile);

    if (renderResult.coordinateChanged) {
      this.combatSceneRenderer.clearDrops();
    }
  }

  destroy(): void {
    if (this.perfInterval) {
      clearInterval(this.perfInterval);
      this.perfInterval = undefined;
    }

    this.combatSceneRenderer.destroy();
    this.explorationSceneRenderer.destroy();

    this.sceneContainer.removeChildren().forEach((child) => {
      child.destroy();
    });

    this.sceneContainer.removeFromParent();
    this.sceneContainer.destroy();
  }

  public playMonsterDamageAnimation(damage: number): Promise<void> {
    return this.combatSceneRenderer.playMonsterDamageAnimation(damage);
  }

  public playMonsterAttackAnimation(damage: number): Promise<void> {
    return this.combatSceneRenderer.playMonsterAttackAnimation(damage);
  }

  public playCombatIntroAnimation(): Promise<void> {
    return this.combatSceneRenderer.playCombatIntroAnimation();
  }

  public playMonsterDeathAnimation(
    reward: MonsterDropReward = {},
    onComplete?: () => void,
  ): Promise<void> {
    return this.combatSceneRenderer.playMonsterDeathAnimation(
      reward,
      onComplete,
    );
  }

  private startPerfLogs(): void {
    this.perfInterval = setInterval(() => {
      const mem = (performance as Performance & { memory?: PerformanceMemory })
        .memory;

      console.log('FPS approx:', this.game.ticker.FPS);
      console.log('World children:', this.container.children.length);
      console.log('Map scene children:', this.sceneContainer.children.length);

      if (mem) {
        console.log('Heap:', Math.round(mem.usedJSHeapSize / 256 / 256), 'MB');
      }
    }, 2000);
  }
}
