import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { from, of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { SaveGameRepository } from 'src/app/database/save-game.repository';
import { MonsterActions } from './monster.actions';
import { selectMonsterState } from './monster.reducer';

export const persistMonster = createEffect(
  (actions$ = inject(Actions), store = inject(Store), repo = inject(SaveGameRepository)) =>
    actions$.pipe(
      ofType(MonsterActions.tamed, MonsterActions.teamSlotSet),
      debounceTime(500),
      withLatestFrom(store.select(selectMonsterState)),
      switchMap(([, monster]) =>
        from(repo.patch({ monster })).pipe(
          map(() => MonsterActions.persistSuccess()),
          catchError((error) => of(MonsterActions.persistFailure({ error }))),
        ),
      ),
    ),
  { functional: true },
);

export const monsterEffects = { persistMonster };
