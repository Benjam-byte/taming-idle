import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Loot } from 'src/app/database/type/loot';

export const LootActions = createActionGroup({
  source: 'Loot',
  events: {
    Hydrate: props<{ loot: Loot }>(),
    Increment: props<{ key: keyof Loot; amount: number }>(),
    Update: props<{ patch: Partial<Loot> }>(),
    Reset: emptyProps(),
    'Persist Success': emptyProps(),
    'Persist Failure': props<{ error: unknown }>(),
  },
});
