import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { SaveGameRepository } from 'src/app/database/save-game.repository';
import { WorldActions } from './world.actions';
import { selectWorldState } from './world.reducer';

export const persistWorld = createEffect(
  (actions$ = inject(Actions), store = inject(Store), repo = inject(SaveGameRepository)) =>
    actions$.pipe(
      ofType(
        WorldActions.playerMoved,
        WorldActions.tilesVisited,
        WorldActions.tilesSeen,
        WorldActions.monstersSpotted,
        WorldActions.chunkExplored,
        WorldActions.markerAdded,
        WorldActions.markerRemoved,
        WorldActions.markersCleared,
        WorldActions.tileMutated,
      ),
      debounceTime(1000),
      withLatestFrom(store.select(selectWorldState)),
      switchMap(([, world]) =>
        from(repo.patch({ world })).pipe(
          map(() => WorldActions.persistSuccess()),
          catchError((error) => of(WorldActions.persistFailure({ error }))),
        ),
      ),
    ),
  { functional: true },
);

export const worldEffects = { persistWorld };
