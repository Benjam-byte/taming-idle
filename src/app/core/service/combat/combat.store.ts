import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Monster, Stat } from './monster';
import { MonsterDefintion } from 'src/app/config/type/monster-type';
import { MonsterDict } from 'src/app/config/monster';
import { pick3WeightedItem } from '../../helpers/choice/picked-weight';

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
  withComputed(
    ({ isCombat, playerTurn, isTurnResolving, monster, player }) => ({
      isMonsterAlive: computed(() => monster()?.isAlive ?? false),
      monsterLife: computed(() => monster()?.stat.hp ?? 0),
      monsterMaxLife: computed(() => monster()?.life ?? 0),
      isPlayerAlive: computed(() => player()?.isAlive ?? false),
      playerLife: computed(() => player()?.stat.hp ?? 0),
      playerMaxLife: computed(() => player()?.life ?? 0),
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
    }),
  ),
  withMethods((store) => ({
    startCombat(): void {
      this.spawnMonster('Slime');
      patchState(store, {
        isCombat: true,
        playerTurn: store.player()!.stat.speed >= store.monster()!.stat.speed,
        isTurnResolving: false,
      });
    },
    endCombat(): void {
      patchState(store, { ...initialState });
    },
    spawnMonster(monsterName: string): void {
      const monsterDef = MonsterDict.find(
        (monsterDef) => monsterDef.name === monsterName,
      );
      if (!monsterDef) return;
      const playerDef = MonsterDict.find(
        (monsterDef) => monsterDef.name === 'Terra larva',
      );
      if (!playerDef) return;

      const monsterStat: Stat = { hp: 10, defense: 0, attack: 1, speed: 0 };
      const playerStat: Stat = { hp: 10, defense: 0, attack: 1, speed: 1 };
      const attackSpeKey = pick3WeightedItem(monsterDef.attackSpeList);

      patchState(store, {
        monster: Monster.create(
          monsterStat,
          monsterDef.baseAttack,
          attackSpeKey,
        ),
        player: Monster.create(
          playerStat,
          monsterDef.baseAttack,
          monsterDef.attackSpeList[0],
        ),
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
