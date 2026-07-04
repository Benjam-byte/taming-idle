import { AnimatedSprite, Application, Container, Texture } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';

const PLAYER_TEXTURE_PREFIX = 'terra_larva_dos';
const PLAYER_FRAME_COUNT = 10;
const PLAYER_PANEL_BOTTOM = 160;
const PLAYER_PANEL_HEIGHT = 82;
const PLAYER_PANEL_HEIGHT_MOBILE = 72;
const PLAYER_SPRITE_GAP = 8;
const PLAYER_SPRITE_SIZE = 260;
const PLAYER_SPRITE_SIZE_MOBILE = 200;
const PLAYER_SPRITE_MOBILE_BREAKPOINT = 480;

export class CombatPlayerRenderer {
  private player?: AnimatedSprite;
  private textures?: Texture[];
  private isVisible = false;

  constructor(
    private readonly game: Application,
    private readonly sceneContainer: Container,
    private readonly pixiAssetService: PixiAssetService,
  ) {}

  get sprite(): AnimatedSprite | undefined {
    return this.player;
  }

  show(): void {
    this.isVisible = true;
    this.ensurePlayer();
    this.layout();

    if (this.player && !this.player.destroyed) {
      this.player.visible = true;
      this.player.play();
    }
  }

  hide(): void {
    this.isVisible = false;

    if (!this.player || this.player.destroyed) {
      return;
    }

    this.player.visible = false;
    this.player.stop();
  }

  destroy(): void {
    if (!this.player) {
      return;
    }

    this.player.removeFromParent();
    this.player.destroy();
    this.player = undefined;
  }

  private ensurePlayer(): void {
    if (this.player && !this.player.destroyed) {
      return;
    }

    const textures = this.getTextures();

    if (textures.length === 0) {
      return;
    }

    const player = new AnimatedSprite(textures);

    player.animationSpeed = 0.16;
    player.anchor.set(0.5);
    player.eventMode = 'none';
    player.zIndex = 12;
    player.visible = this.isVisible;

    this.player = player;
    this.sceneContainer.addChild(player);
  }

  private layout(): void {
    if (!this.player || this.player.destroyed) {
      return;
    }

    const isMobile =
      this.game.screen.width <= PLAYER_SPRITE_MOBILE_BREAKPOINT;
    const size = Math.min(
      isMobile ? PLAYER_SPRITE_SIZE_MOBILE : PLAYER_SPRITE_SIZE,
      this.game.screen.width * 0.55,
    );
    const panelHeight = isMobile
      ? PLAYER_PANEL_HEIGHT_MOBILE
      : PLAYER_PANEL_HEIGHT;

    this.player.width = size;
    this.player.height = size;
    this.player.x = size / 2;
    this.player.y = Math.max(
      size / 2,
      this.game.screen.height -
        PLAYER_PANEL_BOTTOM -
        panelHeight -
        PLAYER_SPRITE_GAP -
        size / 2,
    );
  }

  private getTextures(): Texture[] {
    if (this.textures) {
      return this.textures;
    }

    this.textures = [];

    for (let frame = 1; frame <= PLAYER_FRAME_COUNT; frame++) {
      const texture =
        this.pixiAssetService.spriteSheetAsset?.[
          `${PLAYER_TEXTURE_PREFIX}_${frame}`
        ];

      if (texture) {
        this.textures.push(texture);
      }
    }

    return this.textures;
  }
}
