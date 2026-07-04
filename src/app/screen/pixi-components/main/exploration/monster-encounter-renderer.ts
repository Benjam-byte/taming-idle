import { AnimatedSprite, Application, Container, Texture } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';

export type MonsterEncounterMode = 'exploration' | 'combat';

type MonsterLayout = {
  x: number;
  y: number;
  size: number;
};

const EXPLORATION_MONSTER_SIZE = 400;
const COMBAT_PANEL_TOP = 80;
const COMBAT_PANEL_HEIGHT = 82;
const COMBAT_PANEL_HEIGHT_MOBILE = 72;
const COMBAT_PANEL_GAP = 16;
const COMBAT_PANEL_WIDTH = 320;
const COMBAT_PANEL_WIDTH_MOBILE = 280;
const COMBAT_PANEL_HORIZONTAL_MARGIN = 24;
const COMBAT_PANEL_HORIZONTAL_MARGIN_MOBILE = 18;
const COMBAT_PANEL_MOBILE_BREAKPOINT = 480;

export class MonsterEncounterRenderer {
  private monster?: AnimatedSprite;
  private slimeTextures?: Texture[];
  private isDying = false;
  private mode: MonsterEncounterMode = 'exploration';

  constructor(
    private readonly game: Application,
    private readonly sceneContainer: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly canInteract: () => boolean,
    private readonly onMonsterClick: () => void,
  ) {}

  get sprite(): AnimatedSprite | undefined {
    return this.monster;
  }

  get isMonsterDying(): boolean {
    return this.isDying;
  }

  render(tile: Tile): void {
    if (this.isDying) {
      return;
    }

    this.destroyMonster();

    if (!tile.hasMonster) {
      return;
    }

    const textures = this.getSlimeTextures();

    if (textures.length === 0) {
      return;
    }

    const monster = new AnimatedSprite(textures);

    monster.animationSpeed = 0.2;
    monster.anchor.set(0.5);
    this.applyLayout(monster);
    monster.zIndex = 10;

    monster.eventMode = 'static';
    monster.cursor = 'pointer';

    monster.on('pointertap', () => {
      if (!this.canInteract() || this.isDying) {
        return;
      }

      this.onMonsterClick();
    });

    monster.play();

    this.monster = monster;
    this.sceneContainer.addChild(monster);
  }

  setMode(mode: MonsterEncounterMode): void {
    this.mode = mode;
    this.applyLayout(this.monster);
  }

  takeForDeath(): AnimatedSprite | undefined {
    if (this.isDying || !this.monster || this.monster.destroyed) {
      return undefined;
    }

    this.isDying = true;

    const monster = this.monster;
    this.monster = undefined;

    monster.eventMode = 'none';
    monster.cursor = 'default';
    monster.removeAllListeners();

    return monster;
  }

  finishDeath(): void {
    this.isDying = false;
  }

  destroy(): void {
    this.destroyMonster();
    this.isDying = false;
  }

  private destroyMonster(): void {
    if (!this.monster) {
      return;
    }

    this.monster.removeAllListeners();
    this.monster.removeFromParent();
    this.monster.destroy();
    this.monster = undefined;
  }

  private applyLayout(monster: AnimatedSprite | undefined): void {
    if (!monster || monster.destroyed) {
      return;
    }

    const layout = this.getLayout();

    monster.width = layout.size;
    monster.height = layout.size;
    monster.x = layout.x;
    monster.y = layout.y;
  }

  private getLayout(): MonsterLayout {
    if (this.mode === 'combat') {
      return this.getCombatLayout();
    }

    return {
      x: this.game.screen.width / 2,
      y: this.game.screen.height / 2,
      size: EXPLORATION_MONSTER_SIZE,
    };
  }

  private getCombatLayout(): MonsterLayout {
    const isMobile =
      this.game.screen.width <= COMBAT_PANEL_MOBILE_BREAKPOINT;
    const panelMaxWidth = isMobile
      ? COMBAT_PANEL_WIDTH_MOBILE
      : COMBAT_PANEL_WIDTH;
    const horizontalMargin = isMobile
      ? COMBAT_PANEL_HORIZONTAL_MARGIN_MOBILE
      : COMBAT_PANEL_HORIZONTAL_MARGIN;
    const panelHeight = isMobile
      ? COMBAT_PANEL_HEIGHT_MOBILE
      : COMBAT_PANEL_HEIGHT;
    const size = Math.max(
      160,
      Math.min(panelMaxWidth, this.game.screen.width - horizontalMargin),
    );

    return {
      x: this.game.screen.width - size / 2,
      y: COMBAT_PANEL_TOP + panelHeight + COMBAT_PANEL_GAP + size / 2,
      size,
    };
  }

  private getSlimeTextures(): Texture[] {
    if (this.slimeTextures) {
      return this.slimeTextures;
    }

    const frameCount = 10;

    this.slimeTextures = [];

    for (let i = 0; i < frameCount; i++) {
      const texture = this.pixiAssetService.spriteSheetAsset?.[`slime_${i}`];

      if (texture) {
        this.slimeTextures.push(texture);
      }
    }

    return this.slimeTextures;
  }
}
