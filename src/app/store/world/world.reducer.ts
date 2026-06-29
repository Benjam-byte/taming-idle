import { createFeature, createReducer, on } from '@ngrx/store';
import { DEFAULT_WORLD } from 'src/app/database/default-value/world';
import { WorldSave } from 'src/app/database/type/world';
import { WorldActions } from './world.actions';

const initialState: WorldSave = { ...DEFAULT_WORLD };

export const worldFeature = createFeature({
  name: 'world',
  reducer: createReducer(
    initialState,
    on(WorldActions.hydrate, (_, { world }) => ({ ...DEFAULT_WORLD, ...world })),
    on(WorldActions.playerMoved, (state, { coordinate }) => ({
      ...state,
      playerCoordinate: coordinate,
    })),
    on(WorldActions.tilesVisited, (state, { keys }) => ({
      ...state,
      visitedTileKeys: [...new Set([...state.visitedTileKeys, ...keys])],
    })),
    on(WorldActions.tilesSeen, (state, { keys }) => ({
      ...state,
      seenTileKeys: [...new Set([...state.seenTileKeys, ...keys])],
    })),
    on(WorldActions.monstersSpotted, (state, { keys }) => ({
      ...state,
      spottedMonsterTileKeys: [...new Set([...state.spottedMonsterTileKeys, ...keys])],
    })),
    on(WorldActions.chunkExplored, (state, { key }) => ({
      ...state,
      exploredChunkKeys: state.exploredChunkKeys.includes(key)
        ? state.exploredChunkKeys
        : [...state.exploredChunkKeys, key],
    })),
    on(WorldActions.markerAdded, (state, { marker }) => ({
      ...state,
      markers: [...state.markers, marker],
    })),
    on(WorldActions.markerRemoved, (state, { id }) => ({
      ...state,
      markers: state.markers.filter((m) => m.id !== id),
    })),
    on(WorldActions.markersCleared, (state) => ({
      ...state,
      markers: [],
    })),
    on(WorldActions.tileMutated, (state, { mutation }) => ({
      ...state,
      tileMutations: [
        ...state.tileMutations.filter((m) => m.key !== mutation.key),
        mutation,
      ],
    })),
  ),
});

export const {
  name: worldFeatureName,
  reducer: worldReducer,
  selectWorldState,
  selectPlayerCoordinate,
  selectVisitedTileKeys,
  selectSeenTileKeys,
  selectSpottedMonsterTileKeys,
  selectExploredChunkKeys,
  selectMarkers,
  selectTileMutations,
} = worldFeature;
