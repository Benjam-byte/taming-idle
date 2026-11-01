import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArrowDownIcon } from 'src/app/icons/arrow-down.component';
import { ArrowLeftIcon } from 'src/app/icons/arrow-left.component';
import { ArrowRightIcon } from 'src/app/icons/arrow-right.component';
import { ArrowUpIcon } from 'src/app/icons/arrow-up.component';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

@Component({
  selector: 'app-move-controller',
  standalone: true,
  imports: [
    CommonModule,
    ArrowUpIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowDownIcon,
  ],
  templateUrl: './move-controller.component.html',
  styleUrl: './move-controller.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MoveControllerComponent {
  moveRequested = output<Direction>();
}
