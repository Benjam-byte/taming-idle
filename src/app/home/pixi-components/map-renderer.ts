import {
  AnimatedSprite,
  Application,
  Container,
  Rectangle,
  Sprite,
  Texture,
  Text,
  TextStyle,
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
  private currentTileKey?: string;

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly onResourceClick: () => void,
  ) {}

  init(): void {
    this.sceneContainer.label = 'mapSceneContainer';
    this.container.addChild(this.sceneContainer);
    this.loadBackground();
    this.startPerfLogs();
  }

  render(tile: Tile): void {
    const tileKey = `${tile.coordinate.x}:${tile.coordinate.y}:${tile.hasMonster}:${tile.hasResource}`;

    if (tileKey === this.currentTileKey) {
      return;
    }

    this.currentTileKey = tileKey;

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
    monster.width = 400;
    monster.height = 400;
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

    if (!tile.hasResource) {
      return;
    }

    const texture = this.pixiAssetService.worldCoreAsset!['wheat'];

    this.wheat = new Sprite(texture);
    this.wheat.anchor.set(0.5);
    this.wheat.setSize(80, 80);
    this.wheat.x = this.game.screen.width / 2;
    this.wheat.y = 500;

    this.wheat.eventMode = 'static';
    this.wheat.cursor = 'pointer';

    this.wheat.on('pointertap', () => {
      this.playCollectWheatAnimation(this.wheat!);
    });

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
    const frameWidth = 1024;
    const frameHeight = 1024;
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

  private playCollectWheatAnimation(wheat: Sprite): void {
    wheat.eventMode = 'none';

    const startX = wheat.x;
    const startY = wheat.y;
    const startScaleX = wheat.scale.x;
    const startScaleY = wheat.scale.y;

    const gainText = new Text({
      text: '+1',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 18,
        fill: 'yellow',
        fontWeight: '900',
        stroke: {
          color: 0x140c07,
          width: 4,
        },
      }),
    });

    gainText.anchor.set(0.5);
    gainText.x = wheat.x;
    gainText.y = wheat.y - 42;

    this.sceneContainer.addChild(gainText);

    let elapsed = 0;
    const duration = 520;

    const tick = (ticker: any) => {
      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const shake = Math.sin(progress * Math.PI * 4) * (1 - progress) * 3;
      const floatY = Math.sin(progress * Math.PI) * 8;
      const scaleMultiplier = 1 + easeOut * 0.08;

      wheat.x = startX + shake;
      wheat.y = startY - floatY;
      wheat.rotation = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.05;
      wheat.alpha = 1 - easeOut;

      wheat.scale.set(
        startScaleX * scaleMultiplier,
        startScaleY * scaleMultiplier,
      );

      gainText.y = startY - 42 - easeOut * 28;
      gainText.alpha = 1 - easeOut;
      gainText.scale.set(1 + easeOut * 0.12);

      if (progress >= 1) {
        this.game.ticker.remove(tick);

        gainText.destroy();
        wheat.destroy();

        this.wheat = undefined;
        this.onResourceClick();
      }
    };

    this.game.ticker.add(tick);
  }
}
