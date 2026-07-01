import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MapStore } from 'src/app/core/service/map/map.store';
import {
  Direction,
  MoveControllerComponent,
} from './move-controller/move-controller.component';

@Component({
  selector: 'app-exploration',
  standalone: true,
  imports: [MoveControllerComponent],
  templateUrl: './exploration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorationComponent {
  private readonly mapStore = inject(MapStore);

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
