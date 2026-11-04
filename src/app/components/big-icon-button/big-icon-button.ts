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

export type BigIconButtonIcon =
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down';

@Component({
  selector: 'app-big-icon-button',
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
  templateUrl: './big-icon-button.html',
  styleUrl: './big-icon-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BigIconButton {
  icon = input<BigIconButtonIcon>('arrow-left');
  clicked = output<void>();

  onClicked() {
    this.clicked.emit();
  }
}
