import { Graphics } from 'pixi.js';
import { colors } from 'src/app/core/config/map-colors';
import { Tile } from 'src/app/core/service/map/tile';
import { MinimapConfig } from './minimap-renderer.types';
import { MinimapTileSource } from './minimap-tile-source';
import { MinimapTileStateResolver } from './minimap-tile-state-resolver';

export class MinimapFogRenderer {
  constructor(
    private readonly fogGraphics: Graphics,
    private readonly tileSource: MinimapTileSource,
    private readonly tileStateResolver: MinimapTileStateResolver,
    private readonly config: MinimapConfig,
  ) {}

  render(): void {
    this.fogGraphics.clear();

    this.tileSource.forEachLoadedTile((tile) => {
      this.drawFogTile(tile);
    });
  }

  private drawFogTile(tile: Tile): void {
    const state = this.tileStateResolver.resolve(tile);

    if (state.isVisibleNow || state.isVisited) {
      return;
    }

    const { x, y } = tile.coordinate;
    const px = x * this.config.cellSize;
    const py = y * this.config.cellSize;

    this.fogGraphics
      .rect(px, py, this.config.cellSize, this.config.cellSize)
      .fill({
        color: state.isSeen ? colors.seenFog : colors.unknownFog,
        alpha: state.isSeen ? 0.42 : 0.98,
      });

    this.fogGraphics
      .rect(px, py, this.config.cellSize, this.config.cellSize)
      .stroke({
        color: colors.fogLine,
        alpha: state.isSeen ? 0.22 : 0.5,
        width: 1,
      });
  }
}
