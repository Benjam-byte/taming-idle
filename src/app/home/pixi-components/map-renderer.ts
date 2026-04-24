import {
  AnimatedSprite,
  Application,
  Container,
  Rectangle,
  Sprite,
  Texture,
} from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';

export class MapRenderer {
  private readonly sceneContainer = new Container();

  private background?: Sprite;
  private wheat?: Sprite;
  private monster?: AnimatedSprite;

  private slimeTextures?: Texture[];
  private perfInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly pixiAssetService: PixiAssetService,
  ) {}

  init(): void {
    this.sceneContainer.label = 'mapSceneContainer';
    this.container.addChild(this.sceneContainer);
    this.loadBackground();
    this.startPerfLogs();
  }

  render(tile: Tile): void {
    if (!this.background) {
      return;
    }

    this.updateBackgroundTexture(tile);
    this.updateMonsterTexture(tile);
    this.updateWheatTexture(tile);
  }

  destroy(): void {
    if (this.perfInterval) {
      clearInterval(this.perfInterval);
      this.perfInterval = undefined;
    }

    this.sceneContainer.removeChildren().forEach((child) => child.destroy());

    if (this.sceneContainer.parent) {
      this.sceneContainer.parent.removeChild(this.sceneContainer);
    }

    this.sceneContainer.destroy();
    this.background = undefined;
    this.wheat = undefined;
    this.monster = undefined;
  }

  private startPerfLogs(): void {
    this.perfInterval = setInterval(() => {
      const mem = (performance as any).memory;

      console.log('FPS approx:', this.game.ticker.FPS);
      console.log('World children:', this.container.children.length);
      console.log('Map scene children:', this.sceneContainer.children.length);

      if (mem) {
        console.log(
          'Heap:',
          Math.round(mem.usedJSHeapSize / 1024 / 1024),
          'MB',
        );
      }
    }, 2000);
  }

  private loadBackground(): void {
    const texture = this.getTextureForTile();

    this.background = new Sprite(texture);
    this.background.width = this.game.screen.width;
    this.background.height = this.game.screen.height;

    this.sceneContainer.addChild(this.background);
  }

  private updateBackgroundTexture(tile: Tile): void {
    if (!this.background) {
      return;
    }

    this.background.texture = this.getTextureForTile(tile);
  }

  private updateMonsterTexture(tile: Tile): void {
    if (this.monster) {
      this.sceneContainer.removeChild(this.monster);
      this.monster.destroy();
      this.monster = undefined;
    }

    if (!tile.hasMonster) {
      return;
    }

    const textures = this.getSlimeTextures();
    const monster = new AnimatedSprite(textures);

    monster.animationSpeed = 0.2;
    monster.anchor.set(0.5);
    monster.x = this.game.screen.width / 2;
    monster.y = this.game.screen.height / 2;
    monster.play();

    this.monster = monster;
    this.sceneContainer.addChild(monster);
  }

  private updateWheatTexture(tile: Tile): void {
    if (this.wheat) {
      this.sceneContainer.removeChild(this.wheat);
      this.wheat.destroy();
      this.wheat = undefined;
    }

    if (!tile.hasRessource) {
      return;
    }

    const texture = this.pixiAssetService.worldCoreAsset!['wheat'];

    this.wheat = new Sprite(texture);
    this.wheat.width = 80;
    this.wheat.height = 80;
    this.wheat.x = this.game.screen.width / 2;
    this.wheat.y = 500;

    this.sceneContainer.addChild(this.wheat);
  }

  private getTextureForTile(tile?: Tile): Texture {
    if (tile) {
      return this.pixiAssetService.worldCoreAsset![
        `plaine${this.getTileVariant(tile)}`
      ];
    }

    return this.pixiAssetService.worldCoreAsset!['plaine1'];
  }

  private getTileVariant(tile: Tile): number {
    const seed = Math.abs(tile.coordinate.x * 31 + tile.coordinate.y * 17);
    return (seed % 5) + 1;
  }

  private getSlimeTextures(): Texture[] {
    if (this.slimeTextures) {
      return this.slimeTextures;
    }

    const frameCount = 10;
    const frameWidth = 258;
    const frameHeight = 258;
    const slimeTexture = this.pixiAssetService.spriteSheetAsset!['slime'];

    this.slimeTextures = [];

    for (let i = 0; i < frameCount; i++) {
      this.slimeTextures.push(
        new Texture({
          source: slimeTexture.source,
          frame: new Rectangle(0, i * frameHeight, frameWidth, frameHeight),
        }),
      );
    }

    return this.slimeTextures;
  }
}
