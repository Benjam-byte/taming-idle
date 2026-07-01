import { Application, Container, Sprite, Texture } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { Tile } from 'src/app/core/service/map/tile';

export class BackgroundRenderer {
  private background?: Sprite;

  constructor(
    private readonly game: Application,
    private readonly sceneContainer: Container,
    private readonly pixiAssetService: PixiAssetService,
  ) {}

  init(): void {
    this.background = new Sprite(this.getTextureForTile());
    this.background.width = this.game.screen.width;
    this.background.height = this.game.screen.height;
    this.background.zIndex = 0;

    this.sceneContainer.addChild(this.background);
  }

  render(tile: Tile): void {
    if (!this.background) {
      return;
    }

    this.background.texture = this.getTextureForTile(tile);
  }

  destroy(): void {
    if (!this.background) {
      return;
    }

    this.background.removeFromParent();
    this.background.destroy();
    this.background = undefined;
  }

  private getTextureForTile(tile?: Tile): Texture {
    if (!tile) {
      return this.pixiAssetService.worldCoreAsset!['plaine1'];
    }

    return (
      this.pixiAssetService.worldCoreAsset![tile.path] ??
      this.pixiAssetService.worldCoreAsset!['plaine1']
    );
  }
}
