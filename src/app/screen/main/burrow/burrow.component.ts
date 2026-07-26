import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';
import { BurrowStore } from 'src/app/core/service/burrow/burrow.store';
import { CombatStore } from 'src/app/core/service/combat/combat.store';
import { MapStore } from 'src/app/core/service/map/map.store';
import { ResourceCollectionService } from 'src/app/core/service/resource-collection-service';
import { MapSceneRenderer } from '../../pixi-components/main/map-scene-renderer';

@Component({
  selector: 'app-burrow',
  standalone: true,
  imports: [IconButtonComponent],
  templateUrl: './burrow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurrowComponent {
  private readonly burrowStore = inject(BurrowStore);
  private readonly combatStore = inject(CombatStore);
  private readonly mapStore = inject(MapStore);
  private readonly resourceCollectionService = inject(
    ResourceCollectionService,
  );

  readonly mapSceneRenderer = input<MapSceneRenderer>();
  readonly insideChanged = output<boolean>();

  readonly isInside = this.burrowStore.isInside;
  readonly isCombatRunning = this.combatStore.isCombat;

  constructor() {
    effect(() => {
      this.insideChanged.emit(this.isInside());
    });

    effect(() => {
      const renderer = this.mapSceneRenderer();
      const tile = this.mapStore.activeTile();

      if (!renderer || !tile) {
        return;
      }

      renderer.setBurrowScene(
        this.burrowStore.scene(),
        tile,
        this.isCombatRunning(),
        this.getDepositRemaining(tile.coordinate),
      );
    });
  }

  enter(): void {
    const tile = this.mapStore.activeTile();

    if (!tile || tile.specialType !== 'burrow' || this.isCombatRunning()) {
      return;
    }

    this.mapSceneRenderer()?.clearDrops();
    this.burrowStore.enter(tile.coordinate);
  }

  leave(): void {
    this.burrowStore.leave();
  }

  startCombat(): void {
    if (!this.burrowStore.startAttempt()) {
      return;
    }

    this.combatStore.startCombat('burrow');
    this.mapSceneRenderer()?.showCombatMonster();
  }

  collectDeposit(): boolean {
    const coordinate = this.burrowStore.coordinate();

    return coordinate
      ? this.resourceCollectionService.collectBurrowDepositAt(coordinate)
      : false;
  }

  private getDepositRemaining(coordinate: {
    x: number;
    y: number;
  }): number {
    if (
      this.burrowStore.scene() !== 'bottom' ||
      !this.mapStore.isBurrowCompleted(coordinate)
    ) {
      return 0;
    }

    return Math.max(
      0,
      3 - this.mapStore.getBurrowDepositCollected(coordinate),
    );
  }
}
