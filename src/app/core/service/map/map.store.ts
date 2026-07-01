import { computed, effect, inject, untracked } from '@angular/core';
import { Store } from '@ngrx/store';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { WorldSave } from 'src/app/database/type/world';
import { WorldActions } from 'src/app/store/world/world.actions';
import { Coordinate } from '../../type/coordinate';
import { MapMarker, MapMarkerType } from '../../type/map-maker';
import { Chunk } from './chunks';
import { Tile } from './tile';

export const CHUNK_SIZE = 9;
const LOAD_RADIUS = 1;
const VISION_RADIUS = 2;


function tileKey(x: number, y: number): string {
  return `${x}:${y}`;
}

function chunkKey(cx: number, cy: number): string {
  return `${cx}:${cy}`;
}

function tileToChunkCoord(coord: Coordinate): Coordinate {
  return {
    x: Math.floor(coord.x / CHUNK_SIZE),
    y: Math.floor(coord.y / CHUNK_SIZE),
  };
}

function chunkCenterCoord(chunkCoord: Coordinate): Coordinate {
  const half = Math.floor(CHUNK_SIZE / 2);
  return {
    x: chunkCoord.x * CHUNK_SIZE + half,
    y: chunkCoord.y * CHUNK_SIZE + half,
  };
}


function getTileAt(chunkList: Map<string, Chunk>, coord: Coordinate): Tile | undefined {
  const cc = tileToChunkCoord(coord);
  return chunkList.get(chunkKey(cc.x, cc.y))?.getTileAt(coord);
}

function inVisionRange(tileX: number, tileY: number, px: number, py: number): boolean {
  const dx = tileX - px;
  const dy = tileY - py;
  return dx * dx + dy * dy <= VISION_RADIUS * VISION_RADIUS;
}



type TileMutationState = { hasMonster: boolean; hasResource: boolean };

type MapState = {
  playerCoordinate: Coordinate;
  chunkList: Map<string, Chunk>;
  visitedTileKeys: Set<string>;
  seenTileKeys: Set<string>;
  spottedMonsterTileKeys: Set<string>;
  exploredChunkKeys: Set<string>;
  exploredChunkList: Map<string, Chunk>;
  markers: MapMarker[];
  tileMutations: Map<string, TileMutationState>;
};

const initialMapState: MapState = {
  playerCoordinate: { x: 0, y: 0 },
  chunkList: new Map(),
  visitedTileKeys: new Set(),
  seenTileKeys: new Set(),
  spottedMonsterTileKeys: new Set(),
  exploredChunkKeys: new Set(),
  exploredChunkList: new Map(),
  markers: [],
  tileMutations: new Map(),
};



export const MapStore = signalStore(
  { providedIn: 'root' },
  withState(initialMapState),
  withComputed((store) => ({
    activeChunkCoordinate: computed<Coordinate>(() =>
      tileToChunkCoord(store.playerCoordinate()),
    ),
    activeTile: computed<Tile | undefined>(() =>
      getTileAt(store.chunkList(), store.playerCoordinate()),
    ),
  })),
  withMethods((store, ngrxStore = inject(Store)) => {

    function ensureChunkLoaded(chunkCoord: Coordinate): void {
      const key = chunkKey(chunkCoord.x, chunkCoord.y);
      if (store.chunkList().has(key)) return;

      const chunk = new Chunk(CHUNK_SIZE, chunkCenterCoord(chunkCoord), 1, 5);

      const mutations = store.tileMutations();
      for (const tile of chunk.tileList) {
        const tk = tileKey(tile.coordinate.x, tile.coordinate.y);
        const m = mutations.get(tk);
        if (m) chunk.mutateTile(tile.coordinate, m);
      }

      patchState(store, (state) => ({
        chunkList: new Map(state.chunkList).set(key, chunk),
        exploredChunkKeys: new Set([...state.exploredChunkKeys, key]),
        exploredChunkList: new Map(state.exploredChunkList).set(key, chunk),
      }));

      ngrxStore.dispatch(WorldActions.chunkExplored({ key }));
    }

    function unloadFarChunks(requiredKeys: Set<string>): void {
      const toRemove = [...store.chunkList().keys()].filter((k) => !requiredKeys.has(k));
      if (toRemove.length === 0) return;

      patchState(store, (state) => {
        const next = new Map(state.chunkList);
        for (const k of toRemove) next.delete(k);
        return { chunkList: next };
      });
    }

    function trySpotMonster(tile: Tile): void {
      const key = tileKey(tile.coordinate.x, tile.coordinate.y);
      if (store.spottedMonsterTileKeys().has(key) || Math.random() >= 0.1) return;

      patchState(store, (state) => ({
        spottedMonsterTileKeys: new Set([...state.spottedMonsterTileKeys, key]),
      }));
      ngrxStore.dispatch(WorldActions.monstersSpotted({ keys: [key] }));
    }

    function markVisibleTilesAsSeen(): void {
      const player = store.playerCoordinate();
      const current = store.seenTileKeys();
      const newKeys: string[] = [];

      for (let y = player.y - VISION_RADIUS; y <= player.y + VISION_RADIUS; y++) {
        for (let x = player.x - VISION_RADIUS; x <= player.x + VISION_RADIUS; x++) {
          if (!inVisionRange(x, y, player.x, player.y)) continue;

          const tile = getTileAt(store.chunkList(), { x, y });
          if (!tile) continue;

          const key = tileKey(x, y);
          if (!current.has(key)) newKeys.push(key);

          if (tile.hasMonster) trySpotMonster(tile);
        }
      }

      if (newKeys.length === 0) return;

      patchState(store, (state) => ({
        seenTileKeys: new Set([...state.seenTileKeys, ...newKeys]),
      }));
      ngrxStore.dispatch(WorldActions.tilesSeen({ keys: newKeys }));
    }

    function loadChunksAroundActiveChunk(center: Coordinate): void {
      const requiredKeys = new Set<string>();

      for (let y = center.y - LOAD_RADIUS; y <= center.y + LOAD_RADIUS; y++) {
        for (let x = center.x - LOAD_RADIUS; x <= center.x + LOAD_RADIUS; x++) {
          requiredKeys.add(chunkKey(x, y));
          ensureChunkLoaded({ x, y });
        }
      }

      unloadFarChunks(requiredKeys);
    }

    function markExplorationState(): void {
      const player = store.playerCoordinate();
      const key = tileKey(player.x, player.y);

      if (!store.visitedTileKeys().has(key)) {
        patchState(store, (state) => ({
          visitedTileKeys: new Set([...state.visitedTileKeys, key]),
        }));
        ngrxStore.dispatch(WorldActions.tilesVisited({ keys: [key] }));
      }

      markVisibleTilesAsSeen();
    }


    return {
      hydrate(world: WorldSave): void {
        const tileMutations = new Map(
          world.tileMutations.map((m) => [
            m.key,
            { hasMonster: m.hasMonster, hasResource: m.hasResource },
          ]),
        );
        patchState(store, {
          playerCoordinate: world.playerCoordinate,
          visitedTileKeys: new Set(world.visitedTileKeys),
          seenTileKeys: new Set(world.seenTileKeys),
          spottedMonsterTileKeys: new Set(world.spottedMonsterTileKeys),
          markers: world.markers,
          tileMutations,
        });
      },

      move(dx: number, dy: number): void {
        const player = store.playerCoordinate();
        const next: Coordinate = { x: player.x + dx, y: player.y + dy };

        ensureChunkLoaded(tileToChunkCoord(next));

        if (!getTileAt(store.chunkList(), next)?.isWalkable) return;

        patchState(store, { playerCoordinate: next });
        ngrxStore.dispatch(WorldActions.playerMoved({ coordinate: next }));
      },

      getTileAt(coord: Coordinate): Tile | undefined {
        return getTileAt(store.chunkList(), coord);
      },

      mutateTile(coord: Coordinate, mutation: { hasMonster?: boolean; hasResource?: boolean }): void {
        const cc = tileToChunkCoord(coord);
        const ck = chunkKey(cc.x, cc.y);
        const chunk = store.chunkList().get(ck);
        if (chunk) chunk.mutateTile(coord, mutation);

        const tk = tileKey(coord.x, coord.y);
        patchState(store, (state) => {
          const existing = state.tileMutations.get(tk);
          const next = new Map(state.tileMutations);
          next.set(tk, {
            hasMonster: mutation.hasMonster ?? existing?.hasMonster ?? false,
            hasResource: mutation.hasResource ?? existing?.hasResource ?? false,
          });
          return {
            tileMutations: next,
            chunkList: new Map(state.chunkList),
          };
        });
      },

      isTileVisited(x: number, y: number): boolean {
        return store.visitedTileKeys().has(tileKey(x, y));
      },

      isTileSeen(x: number, y: number): boolean {
        return store.seenTileKeys().has(tileKey(x, y));
      },

      isMonsterSpotted(x: number, y: number): boolean {
        return store.spottedMonsterTileKeys().has(tileKey(x, y));
      },

      isInVisionRange(tileX: number, tileY: number, playerX: number, playerY: number): boolean {
        return inVisionRange(tileX, tileY, playerX, playerY);
      },

      addMarker(coordinate: Coordinate, type: MapMarkerType = 'custom'): void {
        const marker: MapMarker = { id: crypto.randomUUID(), coordinate, type };
        patchState(store, (state) => ({ markers: [...state.markers, marker] }));
        ngrxStore.dispatch(WorldActions.markerAdded({ marker }));
      },

      removeMarker(id: string): void {
        patchState(store, (state) => ({
          markers: state.markers.filter((m) => m.id !== id),
        }));
        ngrxStore.dispatch(WorldActions.markerRemoved({ id }));
      },

      clearMarkers(): void {
        patchState(store, { markers: [] });
        ngrxStore.dispatch(WorldActions.markersCleared());
      },

      _loadChunksAroundActiveChunk: loadChunksAroundActiveChunk,
      _markExplorationState: markExplorationState,
    };
  }),
  withHooks((store) => ({
    onInit() {
      effect(() => {
        const activeChunk = store.activeChunkCoordinate();
        untracked(() => {
          store._loadChunksAroundActiveChunk(activeChunk);
          store._markExplorationState();
        });
      });
    },
  })),
);

export type MapStore = InstanceType<typeof MapStore>;
