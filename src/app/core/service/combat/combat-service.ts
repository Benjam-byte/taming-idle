import { computed, Injectable, signal } from '@angular/core';
import { Monster } from './monster';

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  isCombat = signal(false);
  playerTurn = signal(true);
  isTurnResolving = signal(false);

  private readonly monsterSignal = signal<Monster | null>(null);
  private readonly playerSignal = signal<Monster | null>(null);

  readonly monster = this.monsterSignal.asReadonly();

  readonly isMonsterAlive = computed(() => {
    return this.monster()?.isAlive ?? false;
  });

  readonly monsterLife = computed(() => {
    return this.monster()?.life ?? 0;
  });

  readonly monsterMaxLife = computed(() => {
    return this.monster()?.maxLife ?? 0;
  });

  readonly player = this.playerSignal.asReadonly();

  readonly isPlayerAlive = computed(() => {
    return this.player()?.isAlive ?? false;
  });

  readonly playerLife = computed(() => {
    return this.player()?.life ?? 0;
  });

  readonly playerMaxLife = computed(() => {
    return this.player()?.maxLife ?? 0;
  });

  readonly canPlayerAttack = computed(() => {
    return (
      this.isCombat() &&
      this.playerTurn() &&
      !this.isTurnResolving() &&
      this.isMonsterAlive() &&
      this.isPlayerAlive()
    );
  });

  readonly shouldMonsterAttack = computed(() => {
    return (
      this.isCombat() &&
      !this.playerTurn() &&
      !this.isTurnResolving() &&
      this.isMonsterAlive() &&
      this.isPlayerAlive()
    );
  });

  spawnMonster(isEnchanted: boolean, monsterLevel: number): void {
    this.monsterSignal.set(Monster.create(isEnchanted, monsterLevel));
    this.playerSignal.set(Monster.create(false, 1));
  }

  hitMonster(damage: number): void {
    this.monsterSignal.update((monster) => {
      if (!monster) return monster;

      return monster.getHit(damage);
    });
  }

  hitPlayer(damage: number): void {
    this.playerSignal.update((player) => {
      if (!player) return player;

      return player.getHit(damage);
    });
  }

  giveTurnToMonster(): void {
    this.playerTurn.set(false);
  }

  giveTurnToPlayer(): void {
    this.playerTurn.set(true);
  }

  startTurnResolution(): void {
    this.isTurnResolving.set(true);
  }

  endTurnResolution(): void {
    this.isTurnResolving.set(false);
  }

  clearMonster(): void {
    this.monsterSignal.set(null);
  }

  startCombat(): void {
    this.isCombat.set(true);
    this.playerTurn.set(true);
    this.isTurnResolving.set(false);
    this.spawnMonster(false, 1);
  }

  endCombat(): void {
    this.isCombat.set(false);
    this.playerTurn.set(true);
    this.isTurnResolving.set(false);
    this.clearMonster();
  }
}
