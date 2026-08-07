import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Store } from '@ngrx/store';
import { MonsterSave, TamedMonster } from 'src/app/database/type/monster';
import { Monster } from '../../models/monster';
import { MonsterActions } from '../../../store/monster/monster.actions';

type MonsterState = {
  tamed: TamedMonster[];
};

const initialState: MonsterState = {
  tamed: [],
};

export const MonsterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tamed }) => ({
    tamedCount: computed(() => tamed().length),
  })),
  withMethods((store, ngrxStore = inject(Store)) => ({
    hydrate(save: MonsterSave): void {
      patchState(store, { tamed: save.tamed });
    },

    tame(monster: Monster): TamedMonster {
      const tamed: TamedMonster = {
        id: crypto.randomUUID(),
        monster,
        tamedAt: new Date().toISOString(),
      };

      patchState(store, (state) => ({ tamed: [...state.tamed, tamed] }));
      ngrxStore.dispatch(MonsterActions.tamed({ tamed }));

      return tamed;
    },
  })),
);

export type MonsterStore = InstanceType<typeof MonsterStore>;
