import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Coordinate } from 'src/app/core/type/coordinate';
import { MapMarker } from 'src/app/core/type/map-maker';
import { TileMutation, WorldSave } from 'src/app/database/type/world';

export const WorldActions = createActionGroup({
  source: 'World',
  events: {
    Hydrate: props<{ world: WorldSave }>(),
    'Player Moved': props<{ coordinate: Coordinate }>(),
    'Tiles Visited': props<{ keys: string[] }>(),
    'Tiles Seen': props<{ keys: string[] }>(),
    'Monsters Spotted': props<{ keys: string[] }>(),
    'Chunk Explored': props<{ key: string }>(),
    'Marker Added': props<{ marker: MapMarker }>(),
    'Marker Removed': props<{ id: string }>(),
    'Markers Cleared': emptyProps(),
    'Tile Mutated': props<{ mutation: TileMutation }>(),
    'Persist Success': emptyProps(),
    'Persist Failure': props<{ error: unknown }>(),
  },
});
