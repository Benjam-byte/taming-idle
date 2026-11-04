import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { BigIconButton } from '../big-icon-button/big-icon-button';

@Component({
  selector: 'app-header',
  imports: [BigIconButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  closeModal = output<void>();
  label = input<string>();

  close() {
    this.closeModal.emit();
  }
}
