import { Tile } from 'src/app/core/service/map/tile';

export class TileRenderStateResolver {
  private currentTileKey?: string;

  shouldClearCoordinateDrops(tile: Tile): boolean {
    const nextTileCoordinateKey = this.getCoordinateKey(tile);
    const currentTileCoordinateKey = this.currentTileKey
      ?.split(':')
      .slice(0, 2)
      .join(':');

    return !!(
      currentTileCoordinateKey &&
      currentTileCoordinateKey !== nextTileCoordinateKey
    );
  }

  shouldRender(tile: Tile): boolean {
    const nextTileKey = this.getTileKey(tile);

    if (nextTileKey === this.currentTileKey) {
      return false;
    }

    this.currentTileKey = nextTileKey;
    return true;
  }

  private getCoordinateKey(tile: Tile): string {
    return `${tile.coordinate.x}:${tile.coordinate.y}`;
  }

  private getTileKey(tile: Tile): string {
    return [
      tile.coordinate.x,
      tile.coordinate.y,
      tile.path,
      tile.groundType,
      tile.obstacleType,
      tile.hasMonster,
      tile.hasResource,
    ].join(':');
  }
}
