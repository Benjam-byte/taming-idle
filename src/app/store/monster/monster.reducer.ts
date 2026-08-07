import { createFeature, createReducer, on } from '@ngrx/store';
import { DEFAULT_MONSTER } from 'src/app/database/default-value/monster';
import { MonsterSave } from 'src/app/database/type/monster';
import { MonsterActions } from './monster.actions';

const initialState: MonsterSave = { ...DEFAULT_MONSTER };

export const monsterFeature = createFeature({
  name: 'monster',
  reducer: createReducer(
    initialState,
    on(MonsterActions.hydrate, (_, { monster }) => ({
      ...DEFAULT_MONSTER,
      ...monster,
    })),
    on(MonsterActions.tamed, (state, { tamed }) => ({
      ...state,
      tamed: [...state.tamed, tamed],
    })),
    on(MonsterActions.teamSlotSet, (state, { activeTeamIds }) => ({
      ...state,
      activeTeamIds,
    })),
  ),
});

export const {
  name: monsterFeatureName,
  reducer: monsterReducer,
  selectMonsterState,
  selectTamed,
  selectActiveTeamIds,
} = monsterFeature;
