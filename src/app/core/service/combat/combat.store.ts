import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  MonsterName,
  MonsterReward,
  MONSTER_DEFINITION_RECORD,
  generateMonster,
} from '../../../core/models/monster';
import { AttackResolution, AttackResolver } from './attack-resolver';
import {
  CombatMonster,
  generateCombatMonster,
  getBuffedCharacteristics,
  getHit,
  isAlive,
} from './combat-monster';

export type CombatEnemyConfig = {
  monsterName: MonsterName;
};

type QueuedEnemy = {
  monster: CombatMonster;
  reward: MonsterReward;
};

type CombatState = {
  isCombat: boolean;
  context: CombatContext;
  playerTurn: boolean;
  isTurnResolving: boolean;
  monster: CombatMonster | null;
  player: CombatMonster | null;
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
    monsterName: 'Slime' as const,
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

function getSpecialAttackThreshold(monster: CombatMonster | null): number {
  if (!monster) {
    return 0;
  }

  return monster.attacks.special.turn;
}

function getSpecialAttackCharge(monster: CombatMonster | null): number {
  const threshold = getSpecialAttackThreshold(monster);

  if (!monster || threshold <= 0) {
    return 0;
  }

  return Math.min(100, Math.floor((monster.attacks.stored / threshold) * 100));
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
      currentEnemyNumber: computed(() =>
        isCombat()
          ? Math.min(totalEnemyCount(), defeatedEnemyCount() + 1)
          : 0,
      ),
      remainingEnemyCount: computed(() =>
        Math.max(0, totalEnemyCount() - defeatedEnemyCount()),
      ),
      isMonsterAlive: computed(() => {
        const m = monster();
        return !!m && isAlive(m);
      }),
      monsterLife: computed(
        () => monster()?.attribut.currentCharacteristics.hp ?? 0,
      ),
      monsterMaxLife: computed(
        () => monster()?.attribut.baseCharacteristics.hp ?? 0,
      ),
      isPlayerAlive: computed(() => {
        const p = player();
        return !!p && isAlive(p);
      }),
      playerLife: computed(
        () => player()?.attribut.currentCharacteristics.hp ?? 0,
      ),
      playerMaxLife: computed(
        () => player()?.attribut.baseCharacteristics.hp ?? 0,
      ),
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
          currentPlayer.attacks.stored >= threshold
        );
      }),
      canPlayerAttack: computed(() => {
        const m = monster();
        const p = player();
        return (
          isCombat() &&
          playerTurn() &&
          !isTurnResolving() &&
          !!m &&
          isAlive(m) &&
          !!p &&
          isAlive(p)
        );
      }),
      shouldMonsterAttack: computed(() => {
        const m = monster();
        const p = player();
        return (
          isCombat() &&
          !playerTurn() &&
          !isTurnResolving() &&
          !!m &&
          isAlive(m) &&
          !!p &&
          isAlive(p)
        );
      }),
    }),
  ),
  withMethods((store, attackResolver = inject(AttackResolver)) => {
    function createEnemy(config: CombatEnemyConfig): QueuedEnemy | null {
      const definition = MONSTER_DEFINITION_RECORD[config.monsterName];

      if (!definition) {
        return null;
      }

      return {
        monster: generateCombatMonster(generateMonster(definition)),
        reward: { ...definition.reward },
      };
    }

    function getFirstTurn(
      player: CombatMonster,
      monster: CombatMonster,
    ): boolean {
      return (
        getBuffedCharacteristics(player).speed >=
        getBuffedCharacteristics(monster).speed
      );
    }

    function recordCurrentEnemyCleared(
      reward: MonsterReward,
    ): CombatWaveCompletion {
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
        const player = generateCombatMonster(
          generateMonster(MONSTER_DEFINITION_RECORD['Terra larva']),
        );

        if (enemies.some((enemy) => !enemy)) {
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
          isAlive(monster) ||
          store.currentEnemyDefeatRecorded()
        ) {
          return null;
        }

        return recordCurrentEnemyCleared(
          addRewards(store.accumulatedReward(), store.currentEnemyReward()),
        );
      },
      recordCurrentEnemyTamed(): CombatWaveCompletion | null {
        const monster = store.monster();

        if (!monster || store.currentEnemyDefeatRecorded()) {
          return null;
        }

        return recordCurrentEnemyCleared(store.accumulatedReward());
      },
      startNextEnemy(): boolean {
        const player = store.player();
        const [nextEnemy, ...remainingEnemies] = store.remainingEnemies();

        if (
          !player ||
          !isAlive(player) ||
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
          monster: state.monster ? getHit(state.monster, damage) : null,
        }));
      },
      hitPlayer(damage: number): void {
        patchState(store, (state) => ({
          player: state.player ? getHit(state.player, damage) : null,
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
