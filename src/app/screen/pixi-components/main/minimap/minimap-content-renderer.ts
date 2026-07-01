import { Container, Graphics } from 'pixi.js';
import { colors } from 'src/app/core/config/map-colors';
import { Tile } from 'src/app/core/service/map/tile';
import { MinimapConfig, MinimapTileState } from './minimap-renderer.types';
import { MinimapTileIconsRenderer } from './minimap-tile-icons-renderer';
import { MinimapTileSource } from './minimap-tile-source';
import { MinimapTileStateResolver } from './minimap-tile-state-resolver';

export class MinimapContentRenderer {
  constructor(
    private readonly contentContainer: Container,
    private readonly tileSource: MinimapTileSource,
    private readonly tileStateResolver: MinimapTileStateResolver,
    private readonly tileIconsRenderer: MinimapTileIconsRenderer,
    private readonly config: MinimapConfig,
  ) {}

  render(): void {
    this.contentContainer
      .removeChildren()
      .forEach((child) => child.destroy());

    this.tileSource.forEachLoadedChunk((tileList) => {
      const chunkGraphics = new Graphics();

      for (const tile of tileList) {
        this.drawTile(chunkGraphics, tile);
      }

      this.contentContainer.addChild(chunkGraphics);
    });
  }

  private drawTile(graphics: Graphics, tile: Tile): void {
    const state = this.tileStateResolver.resolve(tile);

    if (!state.isKnown) {
      return;
    }

    const { x, y } = tile.coordinate;
    const px = x * this.config.cellSize;
    const py = y * this.config.cellSize;
    const tileColor = this.getTileColor(tile);
    const alpha = this.getTileAlpha(state);

    graphics.rect(px, py, this.config.cellSize, this.config.cellSize).fill({
      color: tileColor,
      alpha,
    });

    graphics
      .rect(px, py, this.config.cellSize, this.config.cellSize)
      .stroke({ color: colors.tileLine, alpha: 0.22, width: 1 });

    if (tile.obstacleType) {
      this.tileIconsRenderer.drawObstacleIcon(
        graphics,
        px,
        py,
        tile.obstacleType,
        alpha,
      );
    }

    if (tile.hasResource && state.isSeen) {
      this.tileIconsRenderer.drawResourceIcon(
        graphics,
        px,
        py,
        state.isVisibleNow || state.isVisited ? 1 : 0.55,
      );
    }

    const shouldShowMonster =
      tile.hasMonster && (state.isVisited || state.isMonsterSpotted);

    if (shouldShowMonster) {
      this.tileIconsRenderer.drawMonsterIcon(
        graphics,
        px,
        py,
        state.isVisibleNow || state.isVisited ? 1 : 0.65,
      );
    }
  }

  private getTileColor(tile: Tile): number {
    const { x, y } = tile.coordinate;
    const isAlt = Math.abs(x + y) % 2 === 0;

    if (tile.groundType === 'lake') {
      return isAlt ? colors.lake : colors.lakeAlt;
    }

    if (tile.groundType === 'clearing') {
      return isAlt ? colors.clearing : colors.clearingAlt;
    }

    if (tile.groundType === 'darkClearing') {
      return isAlt ? colors.darkClearing : colors.darkClearingAlt;
    }

    if (tile.groundType === 'stoneQuarry') {
      return isAlt ? colors.stoneQuarry : colors.stoneQuarryAlt;
    }

    return isAlt ? colors.clearing : colors.clearingAlt;
  }

  private getTileAlpha(state: MinimapTileState): number {
    if (state.isSeen && !state.isVisited && !state.isVisibleNow) {
      return 0.55;
    }

    return 1;
  }
}
