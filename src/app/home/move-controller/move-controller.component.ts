import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from 'src/app/core/service/map/map';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

@Component({
  selector: 'app-move-controller',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './move-controller.component.html',
  styleUrl: './move-controller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveControllerComponent {
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
