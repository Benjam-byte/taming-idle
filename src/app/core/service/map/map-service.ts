import { computed, effect, Injectable, signal } from '@angular/core';
import { Chunk } from './chunk';
import { Coordinate } from '../../type/coordinate';
import { Tile } from './tile';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  loadRadius = 2;
  chunkSize = 5;

  playerCoordinate = signal<Coordinate>({ x: 0, y: 0 });
  chunkList = signal(new globalThis.Map<string, Chunk>());

  activeChunkCoordinate = computed<Coordinate>(() => {
    const player = this.playerCoordinate();

    return {
      x: Math.floor(player.x / this.chunkSize),
      y: Math.floor(player.y / this.chunkSize),
    };
  });

  activeTile = computed<Tile | undefined>(() => {
    const player = this.playerCoordinate();
    const chunkMap = this.chunkList();

    for (const chunk of chunkMap.values()) {
      for (const tile of chunk.tileList) {
        if (tile.coordinate.x === player.x && tile.coordinate.y === player.y) {
          return tile;
        }
      }
    }

    return undefined;
  });

  constructor() {
    effect(() => {
      const activeChunk = this.activeChunkCoordinate();
      this.loadChunksAroundActiveChunk(activeChunk);
    });
  }

  move(dx: number, dy: number): void {
    this.playerCoordinate.update((player) => ({
      x: player.x + dx,
      y: player.y + dy,
    }));
    console.log(this.playerCoordinate());
  }

  private loadChunksAroundActiveChunk(center: Coordinate): void {
    const requiredCoordinates = this.getCoordinatesInRadius(
      center,
      this.loadRadius,
    );

    const requiredKeys = new Set<string>();

    for (const chunkCoordinate of requiredCoordinates) {
      const key = this.getChunkKey(chunkCoordinate);
      requiredKeys.add(key);
      this.ensureChunkLoaded(chunkCoordinate);
    }

    this.unloadFarChunks(requiredKeys);
  }

  private getCoordinatesInRadius(
    center: Coordinate,
    radius: number,
  ): Coordinate[] {
    const chunkCoordinates: Coordinate[] = [];

    for (let y = center.y - radius; y <= center.y + radius; y++) {
      for (let x = center.x - radius; x <= center.x + radius; x++) {
        chunkCoordinates.push({ x, y });
      }
    }

    return chunkCoordinates;
  }

  private ensureChunkLoaded(chunkCoordinate: Coordinate): void {
    const key = this.getChunkKey(chunkCoordinate);

    this.chunkList.update((chunkMap) => {
      if (chunkMap.has(key)) {
        return chunkMap;
      }

      const nextMap = new globalThis.Map(chunkMap);
      const chunkCenterCoordinate =
        this.getChunkCenterCoordinate(chunkCoordinate);
      const chunk = new Chunk(this.chunkSize, chunkCenterCoordinate, 1, 5);

      nextMap.set(key, chunk);
      return nextMap;
    });
  }

  private unloadFarChunks(requiredKeys: Set<string>): void {
    this.chunkList.update((chunkMap) => {
      const nextMap = new globalThis.Map(chunkMap);

      for (const key of nextMap.keys()) {
        if (!requiredKeys.has(key)) {
          nextMap.delete(key);
        }
      }

      return nextMap;
    });
  }

  private getChunkCenterCoordinate(chunkCoordinate: Coordinate): Coordinate {
    const halfSize = Math.floor(this.chunkSize / 2);

    return {
      x: chunkCoordinate.x * this.chunkSize + halfSize,
      y: chunkCoordinate.y * this.chunkSize + halfSize,
    };
  }

  private getChunkKey(chunkCoordinate: Coordinate): string {
    return `${chunkCoordinate.x}:${chunkCoordinate.y}`;
  }
}
