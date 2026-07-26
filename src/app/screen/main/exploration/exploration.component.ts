import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
} from '@angular/core';
import { MapStore } from 'src/app/core/service/map/map.store';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';
import {
  Direction,
  MoveControllerComponent,
} from './move-controller/move-controller.component';

@Component({
  selector: 'app-exploration',
  standalone: true,
  imports: [MoveControllerComponent, IconButtonComponent],
  templateUrl: './exploration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorationComponent {
  private readonly mapStore = inject(MapStore);

  readonly enterBurrowRequested = output<void>();
  readonly isOnBurrow = computed(
    () => this.mapStore.activeTile()?.specialType === 'burrow',
  );

  move(direction: Direction): void {
    switch (direction) {
      case 'UP':
        this.mapStore.move(0, -1);
        break;
      case 'DOWN':
        this.mapStore.move(0, 1);
        break;
      case 'RIGHT':
        this.mapStore.move(1, 0);
        break;
      case 'LEFT':
        this.mapStore.move(-1, 0);
    }
  }
}
