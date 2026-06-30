import { AnimatedSprite, Application, Container } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';
import { TickerAnimationRunner } from '../utils/ticker-animation-runner';
import { TileRenderStateResolver } from '../tile-render-state-resolver';
import { BackgroundRenderer } from './background-renderer';
import { MonsterEncounterRenderer } from './monster-encounter-renderer';
import { WheatRenderer } from './wheat-renderer';

export type ExplorationRenderResult = {
  coordinateChanged: boolean;
  rendered: boolean;
};

export class ExplorationSceneRenderer {
  private readonly tileRenderStateResolver = new TileRenderStateResolver();
  private readonly backgroundRenderer: BackgroundRenderer;
  private readonly monsterEncounterRenderer: MonsterEncounterRenderer;
  private readonly wheatRenderer: WheatRenderer;

  constructor(
    game: Application,
    sceneContainer: Container,
    pixiAssetService: PixiAssetService,
    animationRunner: TickerAnimationRunner,
    canInteract: () => boolean,
    onResourceClick: () => void,
    onMonsterClick: () => void,
  ) {
    this.backgroundRenderer = new BackgroundRenderer(
      game,
      sceneContainer,
      pixiAssetService,
    );

    this.monsterEncounterRenderer = new MonsterEncounterRenderer(
      game,
      sceneContainer,
      pixiAssetService,
      canInteract,
      onMonsterClick,
    );

    this.wheatRenderer = new WheatRenderer(
      game,
      sceneContainer,
      pixiAssetService,
      animationRunner,
      canInteract,
      onResourceClick,
    );
  }

  get monsterSprite(): AnimatedSprite | undefined {
    return this.monsterEncounterRenderer.sprite;
  }

  get isMonsterDying(): boolean {
    return this.monsterEncounterRenderer.isMonsterDying;
  }

  init(): void {
    this.backgroundRenderer.init();
  }

  render(tile: Tile): ExplorationRenderResult {
    const coordinateChanged =
      this.tileRenderStateResolver.shouldClearCoordinateDrops(tile);

    if (!this.tileRenderStateResolver.shouldRender(tile)) {
      return {
        coordinateChanged,
        rendered: false,
      };
    }

    this.backgroundRenderer.render(tile);
    this.monsterEncounterRenderer.render(tile);
    this.wheatRenderer.render(tile);

    return {
      coordinateChanged,
      rendered: true,
    };
  }

  takeMonsterForDeath(): AnimatedSprite | undefined {
    return this.monsterEncounterRenderer.takeForDeath();
  }

  finishMonsterDeath(): void {
    this.monsterEncounterRenderer.finishDeath();
  }

  destroy(): void {
    this.wheatRenderer.destroy();
    this.monsterEncounterRenderer.destroy();
    this.backgroundRenderer.destroy();
  }
}
