import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  moveRequested = output<Direction>();
}
