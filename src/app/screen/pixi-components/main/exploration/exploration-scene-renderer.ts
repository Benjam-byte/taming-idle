import { AnimatedSprite, Application, Container } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';
import { Coordinate } from 'src/app/core/type/coordinate';
import { TickerAnimationRunner } from '../utils/ticker-animation-runner';
import { TileRenderStateResolver } from '../tile-render-state-resolver';
import { BackgroundRenderer } from './background-renderer';
import {
  MonsterEncounterMode,
  MonsterEncounterRenderer,
} from './monster-encounter-renderer';
import { WheatRenderer } from './wheat-renderer';
import {
  BurrowRenderScene,
  BurrowSceneRenderer,
} from './burrow-scene-renderer';

export type ExplorationRenderResult = {
  coordinateChanged: boolean;
  rendered: boolean;
};

export class ExplorationSceneRenderer {
  private readonly tileRenderStateResolver = new TileRenderStateResolver();
  private readonly backgroundRenderer: BackgroundRenderer;
  private readonly monsterEncounterRenderer: MonsterEncounterRenderer;
  private readonly wheatRenderer: WheatRenderer;
  private readonly burrowSceneRenderer: BurrowSceneRenderer;

  constructor(
    game: Application,
    sceneContainer: Container,
    pixiAssetService: PixiAssetService,
    animationRunner: TickerAnimationRunner,
    canInteract: () => boolean,
    onResourceClick: (coordinate: Coordinate) => void,
    onMonsterClick: () => void,
    onBurrowEntranceClick: () => void,
    onBurrowSlimeClick: () => void,
    onBurrowDepositClick: () => boolean,
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

    this.burrowSceneRenderer = new BurrowSceneRenderer(
      game,
      sceneContainer,
      pixiAssetService,
      animationRunner,
      canInteract,
      onBurrowEntranceClick,
      onBurrowSlimeClick,
      onBurrowDepositClick,
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
    this.burrowSceneRenderer.renderWorld(tile);

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

  setMonsterMode(mode: MonsterEncounterMode): void {
    this.monsterEncounterRenderer.setMode(mode);
  }

  setBurrowScene(
    scene: BurrowRenderScene,
    tile: Tile,
    isCombat: boolean,
    depositRemaining: number,
  ): void {
    if (scene === 'world') {
      this.backgroundRenderer.render(tile);
      this.burrowSceneRenderer.renderWorld(tile);
      return;
    }

    this.backgroundRenderer.renderAsset(
      scene === 'room' ? 'terrier2' : 'terrier3',
    );
    this.burrowSceneRenderer.renderScene(
      scene,
      isCombat,
      depositRemaining,
    );
  }

  showCombatMonster(): void {
    this.burrowSceneRenderer.hideRoomSlimes();
    this.monsterEncounterRenderer.renderMonster();
  }

  destroy(): void {
    this.wheatRenderer.destroy();
    this.monsterEncounterRenderer.destroy();
    this.burrowSceneRenderer.destroy();
    this.backgroundRenderer.destroy();
  }
}
