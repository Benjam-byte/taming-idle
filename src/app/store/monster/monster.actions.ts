import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { MonsterSave, TamedMonster } from 'src/app/database/type/monster';

export const MonsterActions = createActionGroup({
  source: 'Monster',
  events: {
    Hydrate: props<{ monster: MonsterSave }>(),
    Tamed: props<{ tamed: TamedMonster }>(),
    'Persist Success': emptyProps(),
    'Persist Failure': props<{ error: unknown }>(),
  },
});
