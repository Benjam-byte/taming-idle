import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Store } from '@ngrx/store';
import {
  ACTIVE_TEAM_SIZE,
  MonsterSave,
  TamedMonster,
} from 'src/app/database/type/monster';
import { Monster } from '../../models/monster';
import { MonsterActions } from '../../../store/monster/monster.actions';

type MonsterState = {
  tamed: TamedMonster[];
  activeTeamIds: (string | null)[];
};

const initialState: MonsterState = {
  tamed: [],
  activeTeamIds: Array.from({ length: ACTIVE_TEAM_SIZE }, () => null),
};

export const MonsterStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tamed, activeTeamIds }) => ({
    tamedCount: computed(() => tamed().length),
    activeTeam: computed(() => {
      const tamedById = new Map(tamed().map((monster) => [monster.id, monster]));

      return activeTeamIds().map((id) => (id ? tamedById.get(id) ?? null : null));
    }),
  })),
  withMethods((store, ngrxStore = inject(Store)) => ({
    hydrate(save: MonsterSave): void {
      patchState(store, {
        tamed: save.tamed,
        activeTeamIds: save.activeTeamIds,
      });
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

    setTeamSlot(slot: number, tamedId: string | null): void {
      const activeTeamIds = store.activeTeamIds().map((id, index) => {
        if (index === slot) {
          return tamedId;
        }

        return tamedId !== null && id === tamedId ? null : id;
      });

      patchState(store, { activeTeamIds });
      ngrxStore.dispatch(MonsterActions.teamSlotSet({ activeTeamIds }));
    },
  })),
);

export type MonsterStore = InstanceType<typeof MonsterStore>;
