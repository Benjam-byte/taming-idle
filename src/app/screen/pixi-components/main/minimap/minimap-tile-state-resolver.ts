import { MapService } from 'src/app/core/service/map/map-service';
import { Tile } from 'src/app/core/service/map/tile';
import { MinimapTileState } from './minimap-renderer.types';

export class MinimapTileStateResolver {
  constructor(private readonly mapService: MapService) {}

  resolve(tile: Tile): MinimapTileState {
    const { x, y } = tile.coordinate;
    const isVisibleNow = this.isVisibleNow(x, y);
    const isVisited = this.mapService.isTileVisited(x, y);
    const isSeen = this.mapService.isTileSeen(x, y);

    return {
      isVisibleNow,
      isVisited,
      isSeen,
      isKnown: isVisibleNow || isVisited || isSeen,
      isMonsterSpotted: this.mapService.isMonsterSpotted(x, y),
    };
  }

  private isVisibleNow(tileX: number, tileY: number): boolean {
    const player = this.mapService.playerCoordinate();

    return this.mapService.isInVisionRange(tileX, tileY, player.x, player.y);
  }
}
