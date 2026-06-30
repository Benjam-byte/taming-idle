import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Direction,
  MoveControllerComponent,
} from './move-controller/move-controller.component';
import { MapService } from 'src/app/core/service/map/map-service';

@Component({
  selector: 'app-exploration',
  standalone: true,
  imports: [MoveControllerComponent],
  templateUrl: './exploration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplorationComponent {
  private readonly mapService = inject(MapService);

  move(direction: Direction): void {
    switch (direction) {
      case 'UP':
        this.mapService.move(0, -1);
        break;
      case 'DOWN':
        this.mapService.move(0, 1);
        break;
      case 'RIGHT':
        this.mapService.move(1, 0);
        break;
      case 'LEFT':
        this.mapService.move(-1, 0);
    }
  }
}
