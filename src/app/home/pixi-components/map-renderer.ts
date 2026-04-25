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

  private isCollectingWheat = false;
  private wheatCollectTick?: (ticker: any) => void;

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly onResourceClick: () => void,
    private readonly onMonsterClick: () => void,
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

    if (this.wheatCollectTick) {
      this.game.ticker.remove(this.wheatCollectTick);
      this.wheatCollectTick = undefined;
    }

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
      this.monster.removeAllListeners();
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

    monster.eventMode = 'static';
    monster.cursor = 'pointer';

    monster.on('pointertap', () => {
      this.onMonsterClick();
    });

    monster.play();

    this.monster = monster;
    this.sceneContainer.addChild(monster);
  }

  private updateWheatTexture(tile: Tile): void {
    if (this.isCollectingWheat) {
      return;
    }

    if (this.wheat) {
      this.wheat.removeAllListeners();
      this.sceneContainer.removeChild(this.wheat);
      this.wheat.destroy();
      this.wheat = undefined;
    }

    if (!tile.hasResource) {
      return;
    }

    const texture = this.pixiAssetService.worldCoreAsset!['wheat'];

    const wheat = new Sprite(texture);

    wheat.anchor.set(0.5);
    wheat.setSize(80, 80);
    wheat.x = this.game.screen.width / 2;
    wheat.y = 500;

    wheat.eventMode = 'static';
    wheat.cursor = 'pointer';

    wheat.on('pointertap', () => {
      if (this.isCollectingWheat) {
        return;
      }

      this.playCollectWheatAnimation(wheat);
    });

    this.wheat = wheat;
    this.sceneContainer.addChild(wheat);
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
    this.isCollectingWheat = true;

    wheat.eventMode = 'none';
    wheat.cursor = 'default';
    wheat.removeAllListeners();

    const startX = wheat.x;
    const startY = wheat.y;
    const startScaleX = wheat.scale.x;
    const startScaleY = wheat.scale.y;

    const gainText = new Text({
      text: '+1',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 22,
        fontWeight: '900',
        fill: 0xfff3d0,
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
      if (wheat.destroyed || gainText.destroyed) {
        this.game.ticker.remove(tick);
        this.wheatCollectTick = undefined;
        this.isCollectingWheat = false;
        return;
      }

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
        this.wheatCollectTick = undefined;

        gainText.destroy();

        if (!wheat.destroyed) {
          wheat.destroy();
        }

        this.wheat = undefined;
        this.isCollectingWheat = false;

        this.onResourceClick();
      }
    };

    this.wheatCollectTick = tick;
    this.game.ticker.add(tick);
  }
}
