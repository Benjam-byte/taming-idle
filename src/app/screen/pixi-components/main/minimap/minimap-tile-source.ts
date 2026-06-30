import { MapService } from 'src/app/core/service/map/map-service';
import { Tile } from 'src/app/core/service/map/tile';
import { MinimapConfig } from './minimap-renderer.types';

export class MinimapTileSource {
  constructor(
    private readonly mapService: MapService,
    private readonly config: MinimapConfig,
  ) {}

  forEachLoadedChunk(callback: (tileList: Tile[]) => void): void {
    const player = this.mapService.playerCoordinate();
    const chunkSize = this.mapService.chunkSize;
    const chunkMap = this.mapService.chunkList();

    const playerChunkX = Math.floor(player.x / chunkSize);
    const playerChunkY = Math.floor(player.y / chunkSize);

    const startChunkX = playerChunkX - this.config.loadedChunkRadius;
    const endChunkX = playerChunkX + this.config.loadedChunkRadius;
    const startChunkY = playerChunkY - this.config.loadedChunkRadius;
    const endChunkY = playerChunkY + this.config.loadedChunkRadius;

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
        const chunk = chunkMap.get(`${chunkX}:${chunkY}`);

        if (!chunk) {
          continue;
        }

        callback(chunk.tileList);
      }
    }
  }

  forEachLoadedTile(callback: (tile: Tile) => void): void {
    this.forEachLoadedChunk((tileList) => {
      for (const tile of tileList) {
        callback(tile);
      }
    });
  }
}
