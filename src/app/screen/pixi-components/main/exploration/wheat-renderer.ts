import { Application, Container, Sprite, Text, TextStyle } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';
import { easeOutCubic } from '../utils/easing';
import {
  TickerAnimationHandle,
  TickerAnimationRunner,
} from '../utils/ticker-animation-runner';

export class WheatRenderer {
  private wheat?: Sprite;
  private gainText?: Text;
  private collectAnimation?: TickerAnimationHandle;
  private isCollecting = false;

  constructor(
    private readonly game: Application,
    private readonly sceneContainer: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly animationRunner: TickerAnimationRunner,
    private readonly canInteract: () => boolean,
    private readonly onResourceClick: () => void,
  ) { }

  render(tile: Tile): void {
    if (this.isCollecting) {
      return;
    }

    this.destroyWheat();

    if (!tile.hasResource) {
      return;
    }

    const texture = this.pixiAssetService.worldCoreAsset!['wheat'];
    const wheat = new Sprite(texture);

    wheat.anchor.set(0.5);
    wheat.setSize(80, 80);
    wheat.x = this.game.screen.width / 2;
    wheat.y = 500;
    wheat.zIndex = 5;

    wheat.eventMode = 'static';
    wheat.cursor = 'pointer';

    wheat.on('pointertap', () => {
      if (!this.canInteract() || this.isCollecting) {
        return;
      }

      this.playCollectWheatAnimation(wheat);
    });

    this.wheat = wheat;
    this.sceneContainer.addChild(wheat);
  }

  destroy(): void {
    this.collectAnimation?.stop();
    this.collectAnimation = undefined;
    this.destroyGainText();
    this.destroyWheat();
    this.isCollecting = false;
  }

  private playCollectWheatAnimation(wheat: Sprite): void {
    this.isCollecting = true;

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
    gainText.zIndex = 30;

    this.gainText = gainText;
    this.sceneContainer.addChild(gainText);

    let elapsed = 0;
    const duration = 520;

    this.collectAnimation = this.animationRunner.start((ticker) => {
      if (wheat.destroyed || gainText.destroyed) {
        this.collectAnimation = undefined;
        this.isCollecting = false;
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);

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

      if (progress < 1) {
        return false;
      }

      this.collectAnimation = undefined;
      this.destroyGainText();
      this.destroyWheat();
      this.isCollecting = false;

      this.onResourceClick();

      return true;
    });
  }

  private destroyWheat(): void {
    if (!this.wheat) {
      return;
    }

    this.wheat.removeAllListeners();
    this.wheat.removeFromParent();
    this.wheat.destroy();
    this.wheat = undefined;
  }

  private destroyGainText(): void {
    if (!this.gainText) {
      return;
    }

    this.gainText.removeFromParent();
    this.gainText.destroy();
    this.gainText = undefined;
  }
}
