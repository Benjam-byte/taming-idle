import { AnimatedSprite, Application, Container, Texture } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';

export class MonsterEncounterRenderer {
  private monster?: AnimatedSprite;
  private slimeTextures?: Texture[];
  private isDying = false;

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
    monster.width = 400;
    monster.height = 400;
    monster.x = this.game.screen.width / 2;
    monster.y = this.game.screen.height / 2;
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
