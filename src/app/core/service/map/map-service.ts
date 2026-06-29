import { computed, effect, Injectable, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { WorldActions } from 'src/app/store/world/world.actions';
import { WorldSave } from 'src/app/database/type/world';
import { Chunk } from './chunks';
import { Coordinate } from '../../type/coordinate';
import { Tile } from './tile';
import { MapMarker, MapMarkerType } from '../../type/map-maker';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly store = inject(Store);

  readonly markers = signal<MapMarker[]>([]);
  loadRadius = 1;
  private readonly visionRadius = 2;
  chunkSize = 9;

  playerCoordinate = signal<Coordinate>({ x: 0, y: 0 });
  chunkList = signal(new globalThis.Map<string, Chunk>());
  visitedTileKeys = signal(new Set<string>());
  seenTileKeys = signal(new Set<string>());
  spottedMonsterTileKeys = signal(new Set<string>());
  exploredChunkKeys = signal(new Set<string>());
  exploredChunkList = signal(new globalThis.Map<string, Chunk>());

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
      this.markExplorationState();
    });
  }

  hydrate(world: WorldSave): void {
    this.playerCoordinate.set(world.playerCoordinate);
    this.visitedTileKeys.set(new Set(world.visitedTileKeys));
    this.seenTileKeys.set(new Set(world.seenTileKeys));
    this.spottedMonsterTileKeys.set(new Set(world.spottedMonsterTileKeys));
    this.markers.set(world.markers);
  }

  move(dx: number, dy: number): void {
    const player = this.playerCoordinate();

    const nextCoordinate: Coordinate = {
      x: player.x + dx,
      y: player.y + dy,
    };

    const nextChunkCoordinate = this.getChunkCoordinateFromTile(nextCoordinate);

    this.ensureChunkLoaded(nextChunkCoordinate);

    const nextTile = this.getTileAtCoordinate(nextCoordinate);

    if (!nextTile || !nextTile.isWalkable) {
      return;
    }

    this.playerCoordinate.set(nextCoordinate);
    this.store.dispatch(WorldActions.playerMoved({ coordinate: nextCoordinate }));
  }

  refresh(): void {
    this.chunkList.update((chunkMap) => new globalThis.Map(chunkMap));
  }

  markCurrentTileAsVisited(): void {
    const player = this.playerCoordinate();

    this.visitedTileKeys.update((current) => {
      const next = new Set(current);
      next.add(`${player.x}:${player.y}`);
      return next;
    });
  }

  isTileVisited(x: number, y: number): boolean {
    return this.visitedTileKeys().has(this.getTileKeyFromXY(x, y));
  }

  isTileSeen(x: number, y: number): boolean {
    return this.seenTileKeys().has(this.getTileKeyFromXY(x, y));
  }

  isMonsterSpotted(x: number, y: number): boolean {
    return this.spottedMonsterTileKeys().has(this.getTileKeyFromXY(x, y));
  }

  markExplorationState(): void {
    const player = this.playerCoordinate();
    const newVisited = new Set<string>();

    this.visitedTileKeys.update((current) => {
      const next = new Set(current);
      const key = this.getTileKey(player);
      if (!next.has(key)) {
        next.add(key);
        newVisited.add(key);
      }
      return next;
    });

    const newSeen = this.markVisibleTilesAsSeen();

    if (newVisited.size > 0) {
      this.store.dispatch(WorldActions.tilesVisited({ keys: [...newVisited] }));
    }
    if (newSeen.size > 0) {
      this.store.dispatch(WorldActions.tilesSeen({ keys: [...newSeen] }));
    }
  }

  addMarker(coordinate: Coordinate, type: MapMarkerType = 'custom'): void {
    const marker: MapMarker = {
      id: crypto.randomUUID(),
      coordinate,
      type,
    };
    this.markers.update((markers) => [...markers, marker]);
    this.store.dispatch(WorldActions.markerAdded({ marker }));
  }

  isInVisionRange(
    tileX: number,
    tileY: number,
    playerX: number,
    playerY: number,
  ): boolean {
    const dx = tileX - playerX;
    const dy = tileY - playerY;

    return dx * dx + dy * dy <= this.visionRadius * this.visionRadius;
  }

  removeMarker(id: string): void {
    this.markers.update((markers) =>
      markers.filter((marker) => marker.id !== id),
    );
    this.store.dispatch(WorldActions.markerRemoved({ id }));
  }

  clearMarkers(): void {
    this.markers.set([]);
    this.store.dispatch(WorldActions.markersCleared());
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

      this.exploredChunkKeys.update((current) => {
        const next = new Set(current);
        next.add(key);
        return next;
      });

      this.exploredChunkList.update((exploredMap) => {
        const nextExploredMap = new globalThis.Map(exploredMap);
        nextExploredMap.set(key, chunk);
        return nextExploredMap;
      });

      this.store.dispatch(WorldActions.chunkExplored({ key }));

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

  private markVisibleTilesAsSeen(): Set<string> {
    const player = this.playerCoordinate();
    const newSeen = new Set<string>();

    this.seenTileKeys.update((current) => {
      const next = new Set(current);

      for (
        let y = player.y - this.visionRadius;
        y <= player.y + this.visionRadius;
        y++
      ) {
        for (
          let x = player.x - this.visionRadius;
          x <= player.x + this.visionRadius;
          x++
        ) {
          if (!this.isInVisionRange(x, y, player.x, player.y)) {
            continue;
          }

          const tile = this.getTileAtCoordinate({ x, y });

          if (!tile) {
            continue;
          }

          const tileKey = this.getTileKey(tile.coordinate);
          if (!next.has(tileKey)) {
            next.add(tileKey);
            newSeen.add(tileKey);
          }

          if (tile.hasMonster) {
            this.trySpotMonster(tile);
          }
        }
      }

      return next;
    });

    return newSeen;
  }

  private trySpotMonster(tile: Tile): void {
    const key = this.getTileKey(tile.coordinate);

    if (this.spottedMonsterTileKeys().has(key)) {
      return;
    }

    const hasBeenSpotted = Math.random() < 0.1;

    if (!hasBeenSpotted) {
      return;
    }

    this.spottedMonsterTileKeys.update((current) => {
      const next = new Set(current);
      next.add(key);
      return next;
    });

    this.store.dispatch(WorldActions.monstersSpotted({ keys: [key] }));
  }

  private getTileAtCoordinate(coordinate: Coordinate): Tile | undefined {
    const chunkMap = this.chunkList();

    for (const chunk of chunkMap.values()) {
      for (const tile of chunk.tileList) {
        if (
          tile.coordinate.x === coordinate.x &&
          tile.coordinate.y === coordinate.y
        ) {
          return tile;
        }
      }
    }

    return undefined;
  }

  private getChunkCoordinateFromTile(coordinate: Coordinate): Coordinate {
    return {
      x: Math.floor(coordinate.x / this.chunkSize),
      y: Math.floor(coordinate.y / this.chunkSize),
    };
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

  private getTileKey(coordinate: Coordinate): string {
    return `${coordinate.x}:${coordinate.y}`;
  }

  private getTileKeyFromXY(x: number, y: number): string {
    return `${x}:${y}`;
  }
}
