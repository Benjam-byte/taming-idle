import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { Monster } from './monster';

type CombatState = {
  isCombat: boolean;
  playerTurn: boolean;
  isTurnResolving: boolean;
  monster: Monster | null;
  player: Monster | null;
};

const initialState: CombatState = {
  isCombat: false,
  playerTurn: true,
  isTurnResolving: false,
  monster: null,
  player: null,
};

export const CombatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ isCombat, playerTurn, isTurnResolving, monster, player }) => ({
    isMonsterAlive: computed(() => monster()?.isAlive ?? false),
    monsterLife: computed(() => monster()?.life ?? 0),
    monsterMaxLife: computed(() => monster()?.maxLife ?? 0),
    isPlayerAlive: computed(() => player()?.isAlive ?? false),
    playerLife: computed(() => player()?.life ?? 0),
    playerMaxLife: computed(() => player()?.maxLife ?? 0),
    canPlayerAttack: computed(
      () =>
        isCombat() &&
        playerTurn() &&
        !isTurnResolving() &&
        (monster()?.isAlive ?? false) &&
        (player()?.isAlive ?? false),
    ),
    shouldMonsterAttack: computed(
      () =>
        isCombat() &&
        !playerTurn() &&
        !isTurnResolving() &&
        (monster()?.isAlive ?? false) &&
        (player()?.isAlive ?? false),
    ),
  })),
  withMethods((store) => ({
    startCombat(): void {
      patchState(store, {
        isCombat: true,
        playerTurn: true,
        isTurnResolving: false,
        monster: Monster.create(false, 1),
        player: Monster.create(false, 1),
      });
    },
    endCombat(): void {
      patchState(store, { ...initialState });
    },
    spawnMonster(isEnchanted: boolean, monsterLevel: number): void {
      patchState(store, {
        monster: Monster.create(isEnchanted, monsterLevel),
        player: Monster.create(false, 1),
      });
    },
    hitMonster(damage: number): void {
      patchState(store, (state) => ({
        monster: state.monster?.getHit(damage) ?? null,
      }));
    },
    hitPlayer(damage: number): void {
      patchState(store, (state) => ({
        player: state.player?.getHit(damage) ?? null,
      }));
    },
    giveTurnToMonster(): void {
      patchState(store, { playerTurn: false });
    },
    giveTurnToPlayer(): void {
      patchState(store, { playerTurn: true });
    },
    startTurnResolution(): void {
      patchState(store, { isTurnResolving: true });
    },
    endTurnResolution(): void {
      patchState(store, { isTurnResolving: false });
    },
    clearMonster(): void {
      patchState(store, { monster: null });
    },
  })),
);

export type CombatStore = InstanceType<typeof CombatStore>;
