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
import type { MonsterReward } from 'src/app/config/type/monster-type';

export type CombatEnemyConfig = {
  monsterName: string;
  stat: Stat;
};

type QueuedEnemy = {
  monster: Monster;
  reward: MonsterReward;
};

type CombatState = {
  isCombat: boolean;
  context: CombatContext;
  playerTurn: boolean;
  isTurnResolving: boolean;
  monster: Monster | null;
  player: Monster | null;
  currentEnemyReward: MonsterReward;
  remainingEnemies: readonly QueuedEnemy[];
  accumulatedReward: MonsterReward;
  totalEnemyCount: number;
  defeatedEnemyCount: number;
  currentEnemyDefeatRecorded: boolean;
};

export type CombatContext = 'world' | 'burrow';
export type CombatTurnActor = 'player' | 'monster';
export type CombatWaveCompletion =
  | {
      encounterComplete: false;
      reward: null;
    }
  | {
      encounterComplete: true;
      reward: MonsterReward;
    };

const COMBAT_TURN_PREVIEW_COUNT = 6;
const MAX_COMBAT_ENEMY_COUNT = 3;
const SLIME_STAT: Stat = {
  hp: 10,
  defense: 0,
  attack: 1,
  speed: 0,
};

const initialState: CombatState = {
  isCombat: false,
  context: 'world',
  playerTurn: true,
  isTurnResolving: false,
  monster: null,
  player: null,
  currentEnemyReward: createEmptyReward(),
  remainingEnemies: [],
  accumulatedReward: createEmptyReward(),
  totalEnemyCount: 0,
  defeatedEnemyCount: 0,
  currentEnemyDefeatRecorded: false,
};

function createEmptyReward(): MonsterReward {
  return {
    soul: 0,
    glitchedStone: 0,
  };
}

function createSlimeEncounter(
  enemyCount: number,
): readonly CombatEnemyConfig[] {
  return Array.from({ length: enemyCount }, () => ({
    monsterName: 'Slime',
    stat: { ...SLIME_STAT },
  }));
}

function addRewards(
  currentReward: MonsterReward,
  addedReward: MonsterReward,
): MonsterReward {
  return {
    soul: currentReward.soul + addedReward.soul,
    glitchedStone:
      currentReward.glitchedStone + addedReward.glitchedStone,
  };
}

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

function getUpcomingTurns(playerTurn: boolean): readonly CombatTurnActor[] {
  const firstActor: CombatTurnActor = playerTurn ? 'player' : 'monster';
  const secondActor: CombatTurnActor = playerTurn ? 'monster' : 'player';

  return Array.from({ length: COMBAT_TURN_PREVIEW_COUNT }, (_, index) =>
    index % 2 === 0 ? firstActor : secondActor,
  );
}

export const CombatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({
      isCombat,
      context,
      playerTurn,
      isTurnResolving,
      monster,
      player,
      totalEnemyCount,
      defeatedEnemyCount,
    }) => ({
      isBurrowCombat: computed(() => isCombat() && context() === 'burrow'),
      activeEnemy: computed(() => monster()),
      currentEnemyNumber: computed(() =>
        isCombat()
          ? Math.min(totalEnemyCount(), defeatedEnemyCount() + 1)
          : 0,
      ),
      remainingEnemyCount: computed(() =>
        Math.max(0, totalEnemyCount() - defeatedEnemyCount()),
      ),
      isMonsterAlive: computed(() => monster()?.isAlive ?? false),
      monsterLife: computed(() => monster()?.life ?? 0),
      monsterMaxLife: computed(() => monster()?.stat.hp ?? 0),
      isPlayerAlive: computed(() => player()?.isAlive ?? false),
      playerLife: computed(() => player()?.life ?? 0),
      playerMaxLife: computed(() => player()?.stat.hp ?? 0),
      upcomingTurns: computed(() => getUpcomingTurns(playerTurn())),
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
  withMethods((store, attackResolver = inject(AttackResolver)) => {
    function createMonster(monsterName: string, stat: Stat): Monster | null {
      const monsterDef = MonsterDict.find(
        (definition) => definition.name === monsterName,
      );

      if (!monsterDef) {
        return null;
      }

      return Monster.create(
        stat,
        monsterDef.baseAttack,
        pick3WeightedItem(monsterDef.attackSpeList),
      );
    }

    function createEnemy(config: CombatEnemyConfig): QueuedEnemy | null {
      const monsterDef = MonsterDict.find(
        (definition) => definition.name === config.monsterName,
      );
      const monster = createMonster(config.monsterName, config.stat);

      if (!monsterDef || !monster) {
        return null;
      }

      return {
        monster,
        reward: { ...monsterDef.reward },
      };
    }

    function getFirstTurn(player: Monster, monster: Monster): boolean {
      return player.buffedStat.speed >= monster.buffedStat.speed;
    }

    return {
      startCombat(
        context: CombatContext = 'world',
        enemyConfigs: readonly CombatEnemyConfig[] = createSlimeEncounter(
          context === 'burrow' ? MAX_COMBAT_ENEMY_COUNT : 1,
        ),
      ): boolean {
        if (
          enemyConfigs.length === 0 ||
          enemyConfigs.length > MAX_COMBAT_ENEMY_COUNT
        ) {
          return false;
        }

        const enemies = enemyConfigs.map((config) => createEnemy(config));
        const player = createMonster('Terra larva', {
          hp: 100,
          defense: 0,
          attack: 10,
          speed: 1,
        });

        if (!player || enemies.some((enemy) => !enemy)) {
          return false;
        }

        const [currentEnemy, ...remainingEnemies] =
          enemies as QueuedEnemy[];

        patchState(store, {
          monster: currentEnemy.monster,
          player,
          isCombat: true,
          context,
          playerTurn: getFirstTurn(player, currentEnemy.monster),
          isTurnResolving: false,
          currentEnemyReward: currentEnemy.reward,
          remainingEnemies,
          accumulatedReward: createEmptyReward(),
          totalEnemyCount: enemies.length,
          defeatedEnemyCount: 0,
          currentEnemyDefeatRecorded: false,
        });
        return true;
      },
      endCombat(): void {
        patchState(store, { ...initialState });
      },
      recordCurrentEnemyDefeat(): CombatWaveCompletion | null {
        const monster = store.monster();

        if (
          !monster ||
          monster.isAlive ||
          store.currentEnemyDefeatRecorded()
        ) {
          return null;
        }

        const reward = addRewards(
          store.accumulatedReward(),
          store.currentEnemyReward(),
        );
        const defeatedEnemyCount = Math.min(
          store.totalEnemyCount(),
          store.defeatedEnemyCount() + 1,
        );
        const encounterComplete =
          defeatedEnemyCount === store.totalEnemyCount();

        patchState(store, {
          accumulatedReward: reward,
          defeatedEnemyCount,
          currentEnemyDefeatRecorded: true,
        });

        return encounterComplete
          ? { encounterComplete: true, reward }
          : { encounterComplete: false, reward: null };
      },
      startNextEnemy(): boolean {
        const player = store.player();
        const [nextEnemy, ...remainingEnemies] = store.remainingEnemies();

        if (
          !player ||
          !player.isAlive ||
          !nextEnemy ||
          !store.currentEnemyDefeatRecorded()
        ) {
          return false;
        }

        patchState(store, {
          monster: nextEnemy.monster,
          currentEnemyReward: nextEnemy.reward,
          remainingEnemies,
          playerTurn: getFirstTurn(player, nextEnemy.monster),
          currentEnemyDefeatRecorded: false,
        });
        return true;
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
    };
  }),
);

export type CombatStore = InstanceType<typeof CombatStore>;
