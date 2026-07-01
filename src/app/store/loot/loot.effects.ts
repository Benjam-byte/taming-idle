import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { SaveGameRepository } from 'src/app/database/save-game.repository';
import { LootActions } from './loot.actions';
import { selectLootState } from './loot.reducer';

export const persistLoot = createEffect(
  (actions$ = inject(Actions), store = inject(Store), repo = inject(SaveGameRepository)) =>
    actions$.pipe(
      ofType(LootActions.increment, LootActions.update, LootActions.reset),
      debounceTime(500),
      withLatestFrom(store.select(selectLootState)),
      switchMap(([, loot]) =>
        from(repo.patch({ loot })).pipe(
          map(() => LootActions.persistSuccess()),
          catchError((error) => of(LootActions.persistFailure({ error }))),
        ),
      ),
    ),
  { functional: true },
);

export const lootEffects = { persistLoot };
