import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ArrowDownIcon } from '../../icons/arrow-down.component';
import { ArrowLeftIcon } from '../../icons/arrow-left.component';
import { ArrowRightIcon } from '../../icons/arrow-right.component';
import { ArrowUpIcon } from '../../icons/arrow-up.component';
import { ChevronDownIcon } from '../../icons/chevron-down.component';
import { ChevronLeftIcon } from '../../icons/chevron-left.component';
import { ChevronRightIcon } from '../../icons/chevron-right.component';
import { ChevronUpIcon } from '../../icons/chevron-up.component';
import { BigIconButtonIcon } from '../big-icon-button/big-icon-button';

export type BigButtonColor = 'nature' | 'mana';

@Component({
  selector: 'app-big-button',
  imports: [
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
    ChevronDownIcon,
  ],
  templateUrl: './big-button.html',
  styleUrl: './big-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigButton {
  label = input.required<string>();
  color = input<BigButtonColor>('nature');
  icon = input<BigIconButtonIcon>();
  clicked = output<void>();

  onClicked() {
    this.clicked.emit();
  }
}
