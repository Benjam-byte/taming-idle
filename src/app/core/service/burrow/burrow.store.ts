import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Coordinate } from '../../type/coordinate';
import { MapStore } from '../map/map.store';

export const BURROW_ENEMY_COUNT = 3;

export type BurrowScene = 'world' | 'room' | 'bottom';

type BurrowState = {
  scene: BurrowScene;
  coordinate: Coordinate | null;
  attemptStarted: boolean;
  defeatedEnemies: number;
};

const initialState: BurrowState = {
  scene: 'world',
  coordinate: null,
  attemptStarted: false,
  defeatedEnemies: 0,
};

export const BurrowStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ scene, attemptStarted }) => ({
    isInside: computed(() => scene() !== 'world'),
    isRoom: computed(() => scene() === 'room'),
    isBottom: computed(() => scene() === 'bottom'),
    canStartAttempt: computed(() => scene() === 'room' && !attemptStarted()),
  })),
  withMethods((store, mapStore = inject(MapStore)) => ({
    enter(coordinate: Coordinate): void {
      patchState(store, {
        scene: mapStore.isBurrowSpent(coordinate) ? 'bottom' : 'room',
        coordinate: { ...coordinate },
        attemptStarted: false,
        defeatedEnemies: 0,
      });
    },

    startAttempt(): boolean {
      const coordinate = store.coordinate();

      if (!coordinate || !store.canStartAttempt()) {
        return false;
      }

      mapStore.spendBurrow(coordinate);
      patchState(store, { attemptStarted: true });
      return true;
    },

    recordEnemyDefeated(): number {
      const defeatedEnemies = Math.min(
        BURROW_ENEMY_COUNT,
        store.defeatedEnemies() + 1,
      );
      patchState(store, { defeatedEnemies });
      return defeatedEnemies;
    },

    complete(): void {
      const coordinate = store.coordinate();

      if (coordinate) {
        mapStore.completeBurrow(coordinate);
      }

      patchState(store, {
        scene: 'bottom',
        attemptStarted: false,
        defeatedEnemies: BURROW_ENEMY_COUNT,
      });
    },

    abort(): void {
      patchState(store, { ...initialState });
    },

    leave(): void {
      if (store.attemptStarted()) {
        return;
      }

      patchState(store, { ...initialState });
    },
  })),
);

export type BurrowStore = InstanceType<typeof BurrowStore>;
