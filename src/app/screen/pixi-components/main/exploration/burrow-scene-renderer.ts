import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  Texture,
} from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';
import {
  TickerAnimationHandle,
  TickerAnimationRunner,
} from '../utils/ticker-animation-runner';

export type BurrowRenderScene = 'world' | 'room' | 'bottom';

export class BurrowSceneRenderer {
  private entranceHotspot?: Graphics;
  private readonly roomSlimes: AnimatedSprite[] = [];
  private slimeTextures?: Texture[];
  private deposit?: Sprite;
  private depositGainText?: Text;
  private depositAnimation?: TickerAnimationHandle;
  private isCollectingDeposit = false;

  constructor(
    private readonly game: Application,
    private readonly sceneContainer: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly animationRunner: TickerAnimationRunner,
    private readonly canInteract: () => boolean,
    private readonly onEntranceClick: () => void,
    private readonly onSlimeClick: () => void,
    private readonly onDepositClick: () => boolean,
  ) {}

  renderWorld(tile: Tile): void {
    this.clearRoomSlimes();
    this.destroyEntrance();
    this.destroyDeposit();

    if (tile.specialType !== 'burrow') {
      return;
    }

    const hotspot = new Graphics();
    const radiusX = Math.max(70, this.game.screen.width * 0.18);
    const radiusY = Math.max(55, this.game.screen.height * 0.09);

    hotspot
      .ellipse(
        this.game.screen.width / 2,
        this.game.screen.height * 0.38,
        radiusX,
        radiusY,
      )
      .fill({ color: 0xffffff, alpha: 0.001 });
    hotspot.zIndex = 5;
    hotspot.eventMode = 'static';
    hotspot.cursor = 'pointer';
    hotspot.on('pointertap', () => {
      if (this.canInteract()) {
        this.onEntranceClick();
      }
    });

    this.entranceHotspot = hotspot;
    this.sceneContainer.addChild(hotspot);
  }

  renderScene(
    scene: BurrowRenderScene,
    isCombat: boolean,
    depositRemaining: number,
  ): void {
    this.destroyEntrance();
    this.clearRoomSlimes();

    if (scene === 'room' && !isCombat) {
      this.destroyDeposit();
      this.renderRoomSlimes();
      return;
    }

    if (scene === 'bottom' && depositRemaining > 0) {
      this.renderDeposit();
      return;
    }

    this.destroyDeposit();
  }

  hideRoomSlimes(): void {
    this.clearRoomSlimes();
  }

  destroy(): void {
    this.destroyEntrance();
    this.clearRoomSlimes();
    this.destroyDeposit();
  }

  private renderDeposit(): void {
    if (this.deposit) {
      return;
    }

    const texture =
      this.pixiAssetService.worldCoreAsset?.['Gisement_Glitched_stone'];

    if (!texture) {
      return;
    }

    const deposit = new Sprite(texture);
    const size = Math.max(
      300,
      Math.min(
        560,
        this.game.screen.width * 0.96,
        this.game.screen.height * 0.72,
      ),
    );

    deposit.anchor.set(0.5);
    deposit.setSize(size, size);
    deposit.x = this.game.screen.width / 2;
    deposit.y = this.game.screen.height * 0.52;
    deposit.zIndex = 10;
    deposit.eventMode = 'static';
    deposit.cursor = 'pointer';
    deposit.on('pointertap', () => {
      if (!this.canInteract() || this.isCollectingDeposit) {
        return;
      }

      this.playDepositCollectionAnimation(deposit);
    });

    this.deposit = deposit;
    this.sceneContainer.addChild(deposit);
  }

  private playDepositCollectionAnimation(deposit: Sprite): void {
    this.isCollectingDeposit = true;
    deposit.eventMode = 'none';
    deposit.cursor = 'default';

    const startX = deposit.x;
    const startY = deposit.y;
    const startScaleX = deposit.scale.x;
    const startScaleY = deposit.scale.y;
    const gainText = new Text({
      text: '+1',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 22,
        fontWeight: '900',
        fill: 0xe9ccff,
        stroke: {
          color: 0x1c092c,
          width: 4,
        },
      }),
    });

    gainText.anchor.set(0.5);
    gainText.x = startX;
    gainText.y = startY - deposit.height * 0.45;
    gainText.zIndex = 30;
    this.depositGainText = gainText;
    this.sceneContainer.addChild(gainText);

    let elapsed = 0;
    const duration = 420;

    this.depositAnimation = this.animationRunner.start((ticker) => {
      if (deposit.destroyed || gainText.destroyed) {
        this.depositAnimation = undefined;
        this.isCollectingDeposit = false;
        return true;
      }

      elapsed += ticker.deltaMS;
      const progress = Math.min(elapsed / duration, 1);
      const movement = 1 - progress;
      const rise = Math.sin(progress * Math.PI);

      deposit.x =
        startX + Math.sin(progress * Math.PI * 5) * movement * 9;
      deposit.y = startY - rise * 12;
      deposit.rotation =
        Math.sin(progress * Math.PI * 4) * movement * 0.045;
      deposit.scale.set(
        startScaleX * (1 + rise * 0.06),
        startScaleY * (1 - rise * 0.035),
      );

      gainText.y = startY - deposit.height * 0.45 - progress * 30;
      gainText.alpha = 1 - progress;
      gainText.scale.set(1 + progress * 0.12);

      if (progress < 1) {
        return false;
      }

      deposit.x = startX;
      deposit.y = startY;
      deposit.rotation = 0;
      deposit.scale.set(startScaleX, startScaleY);
      this.depositAnimation = undefined;
      this.destroyDepositGainText();
      this.isCollectingDeposit = false;

      this.onDepositClick();

      if (!deposit.destroyed && this.deposit === deposit) {
        deposit.eventMode = 'static';
        deposit.cursor = 'pointer';
      }

      return true;
    });
  }

  private renderRoomSlimes(): void {
    const textures = this.getSlimeTextures();

    if (textures.length === 0) {
      return;
    }

    const positions = [0.24, 0.5, 0.76];
    const profiles = this.shuffle([
      { minY: 0.34, maxY: 0.43, minScale: 0.78, maxScale: 0.9 },
      { minY: 0.45, maxY: 0.54, minScale: 0.95, maxScale: 1.05 },
      { minY: 0.56, maxY: 0.65, minScale: 1.1, maxScale: 1.22 },
    ]);
    const baseSize = Math.max(
      72,
      Math.min(
        145,
        this.game.screen.width * 0.2,
        this.game.screen.height * 0.18,
      ),
    );

    for (let index = 0; index < positions.length; index++) {
      const profile = profiles[index];
      const size =
        baseSize * this.randomBetween(profile.minScale, profile.maxScale);
      const rawY =
        this.game.screen.height *
        this.randomBetween(profile.minY, profile.maxY);
      const y = Math.max(
        size / 2 + 20,
        Math.min(
          this.game.screen.height - size / 2 - 90,
          rawY,
        ),
      );
      const slime = new AnimatedSprite(textures);

      slime.animationSpeed = 0.2;
      slime.anchor.set(0.5);
      slime.width = size;
      slime.height = size;
      slime.x = this.game.screen.width * positions[index];
      slime.y = y;
      slime.zIndex = 10;
      slime.eventMode = 'static';
      slime.cursor = 'pointer';
      slime.on('pointertap', () => {
        if (this.canInteract()) {
          this.onSlimeClick();
        }
      });
      slime.play();

      this.roomSlimes.push(slime);
      this.sceneContainer.addChild(slime);
    }
  }

  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private shuffle<T>(values: T[]): T[] {
    const shuffled = [...values];

    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled;
  }

  private clearRoomSlimes(): void {
    for (const slime of this.roomSlimes) {
      slime.removeAllListeners();
      slime.removeFromParent();
      slime.destroy();
    }

    this.roomSlimes.length = 0;
  }

  private destroyEntrance(): void {
    if (!this.entranceHotspot) {
      return;
    }

    this.entranceHotspot.removeAllListeners();
    this.entranceHotspot.removeFromParent();
    this.entranceHotspot.destroy();
    this.entranceHotspot = undefined;
  }

  private destroyDeposit(): void {
    this.depositAnimation?.stop();
    this.depositAnimation = undefined;
    this.isCollectingDeposit = false;
    this.destroyDepositGainText();

    if (!this.deposit) {
      return;
    }

    this.deposit.removeAllListeners();
    this.deposit.removeFromParent();
    this.deposit.destroy();
    this.deposit = undefined;
  }

  private destroyDepositGainText(): void {
    if (!this.depositGainText) {
      return;
    }

    this.depositGainText.removeFromParent();
    this.depositGainText.destroy();
    this.depositGainText = undefined;
  }

  private getSlimeTextures(): Texture[] {
    if (this.slimeTextures) {
      return this.slimeTextures;
    }

    this.slimeTextures = Array.from({ length: 10 }, (_, index) =>
      this.pixiAssetService.spriteSheetAsset?.[`slime_${index}`],
    ).filter((texture): texture is Texture => !!texture);

    return this.slimeTextures;
  }
}
