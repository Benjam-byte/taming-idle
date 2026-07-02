import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Monster, Stat } from './monster';
import { AttackSpeDict } from 'src/app/config/attack';
import { MonsterDict } from 'src/app/config/monster';
import { pick3WeightedItem } from '../../helpers/choice/picked-weight';
import { AttackResolution, AttackResolver } from './attack-resolver';

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

function getSpecialAttackThreshold(monster: Monster | null): number {
  if (!monster) {
    return 0;
  }

  return (
    AttackSpeDict.find((attackSpe) => attackSpe.name === monster.attackSpe)
      ?.turn ?? 0
  );
}

function getSpecialAttackCharge(monster: Monster | null): number {
  const threshold = getSpecialAttackThreshold(monster);

  if (!monster || threshold <= 0) {
    return 0;
  }

  return Math.min(100, Math.floor((monster.attackStocked / threshold) * 100));
}

export const CombatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({ isCombat, playerTurn, isTurnResolving, monster, player }) => ({
      isMonsterAlive: computed(() => monster()?.isAlive ?? false),
      monsterLife: computed(() => monster()?.life ?? 0),
      monsterMaxLife: computed(() => monster()?.stat.hp ?? 0),
      isPlayerAlive: computed(() => player()?.isAlive ?? false),
      playerLife: computed(() => player()?.life ?? 0),
      playerMaxLife: computed(() => player()?.stat.hp ?? 0),
      playerSpecialAttackCharge: computed(() =>
        getSpecialAttackCharge(player()),
      ),
      isPlayerSpecialAttackReady: computed(() => {
        const currentPlayer = player();
        const threshold = getSpecialAttackThreshold(currentPlayer);

        return (
          !!currentPlayer &&
          threshold > 0 &&
          currentPlayer.attackStocked >= threshold
        );
      }),
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
  withMethods((store, attackResolver = inject(AttackResolver)) => ({
    startCombat(): void {
      this.spawnMonster('Slime');
      patchState(store, {
        isCombat: true,
        playerTurn:
          store.player()!.buffedStat.speed >= store.monster()!.buffedStat.speed,
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
      const monsterAttackSpeKey = pick3WeightedItem(monsterDef.attackSpeList);
      const playerAttackSpeKey = pick3WeightedItem(playerDef.attackSpeList);

      patchState(store, {
        monster: Monster.create(
          monsterStat,
          monsterDef.baseAttack,
          monsterAttackSpeKey,
        ),
        player: Monster.create(
          playerStat,
          playerDef.baseAttack,
          playerAttackSpeKey,
        ),
      });
    },
    resolvePlayerAttack(): AttackResolution | null {
      const player = store.player();
      const monster = store.monster();

      if (!player || !monster) {
        return null;
      }

      const resolution = attackResolver.resolveAttack(player, monster);

      patchState(store, {
        player: resolution.attacker,
        monster: resolution.target,
      });

      return resolution;
    },
    resolveMonsterAttack(): AttackResolution | null {
      const monster = store.monster();
      const player = store.player();

      if (!monster || !player) {
        return null;
      }

      const resolution = attackResolver.resolveAttack(monster, player);

      patchState(store, {
        monster: resolution.attacker,
        player: resolution.target,
      });

      return resolution;
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
