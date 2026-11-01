import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ArrowLeftIcon } from '../../icons/arrow-left.component';

@Component({
  selector: 'app-big-button',
  imports: [ArrowLeftIcon],
  templateUrl: './big-button.html',
  styleUrl: './big-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigButton {}
