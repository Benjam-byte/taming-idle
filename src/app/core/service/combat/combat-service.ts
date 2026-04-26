import { computed, Injectable, signal } from '@angular/core';
import { Monster } from './monster';

@Injectable({
  providedIn: 'root',
})
export class CombatService {
  isCombat = signal(false);
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
  readonly playerLife = computed(() => {
    return this.player()?.life ?? 0;
  });
  readonly playerMaxLife = computed(() => {
    return this.player()?.maxLife ?? 0;
  });

  spawnMonster(isEnchanted: boolean, monsterLevel: number): void {
    this.monsterSignal.set(Monster.create(isEnchanted, monsterLevel));
    this.playerSignal.set(Monster.create(isEnchanted, monsterLevel));
  }

  hitMonster(damage: number): void {
    this.monsterSignal.update((monster) => {
      if (!monster) return monster;

      return monster.getHit(damage);
    });
    this.hitPlayer(1);
  }

  hitPlayer(damage: number): void {
    this.playerSignal.update((player) => {
      if (!player) return player;

      return player.getHit(damage);
    });
  }

  clearMonster(): void {
    this.monsterSignal.set(null);
  }

  startCombat(): void {
    this.isCombat.update(() => true);
    this.spawnMonster(false, 1);
  }

  endCombat(): void {
    this.isCombat.update(() => false);
  }
}
