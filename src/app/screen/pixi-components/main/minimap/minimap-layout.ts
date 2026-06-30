import { Application } from 'pixi.js';
import { Coordinate } from 'src/app/core/type/coordinate';
import {
  MinimapConfig,
  MinimapPositionTarget,
  MinimapSize,
} from './minimap-renderer.types';

export class MinimapLayout {
  constructor(
    private readonly game: Application,
    private readonly config: MinimapConfig,
  ) {}

  layoutScene(
    sceneContainer: MinimapPositionTarget,
    viewportContainer: MinimapPositionTarget,
    playerGraphics: MinimapPositionTarget,
    positionText: MinimapPositionTarget,
  ): void {
    const { totalWidth } = this.getSize();

    sceneContainer.x = this.game.screen.width - totalWidth - this.config.margin;
    sceneContainer.y = this.config.margin;

    viewportContainer.x = this.config.padding;
    viewportContainer.y = this.config.padding;

    playerGraphics.x = this.config.padding;
    playerGraphics.y = this.config.padding;

    positionText.x = 15;
    positionText.y = 10;
  }

  positionContent(
    contentContainer: MinimapPositionTarget,
    fogContainer: MinimapPositionTarget,
    player: Coordinate,
  ): void {
    const offset = this.getContentOffset(player);

    contentContainer.x = offset.x;
    contentContainer.y = offset.y;

    fogContainer.x = offset.x;
    fogContainer.y = offset.y;
  }

  getSize(): MinimapSize {
    const visiblePixelWidth =
      this.config.visibleTileWidth * this.config.cellSize;
    const visiblePixelHeight =
      this.config.visibleTileHeight * this.config.cellSize;

    return {
      visiblePixelWidth,
      visiblePixelHeight,
      totalWidth: visiblePixelWidth + this.config.padding * 2,
      totalHeight: visiblePixelHeight + this.config.padding * 2,
    };
  }

  getPlayerCenter(): Coordinate {
    const { visiblePixelWidth, visiblePixelHeight } = this.getSize();

    return {
      x: visiblePixelWidth / 2,
      y: visiblePixelHeight / 2,
    };
  }

  private getContentOffset(player: Coordinate): Coordinate {
    const playerCenter = this.getPlayerCenter();

    return {
      x:
        playerCenter.x -
        (player.x * this.config.cellSize + this.config.cellSize / 2),
      y:
        playerCenter.y -
        (player.y * this.config.cellSize + this.config.cellSize / 2),
    };
  }
}
