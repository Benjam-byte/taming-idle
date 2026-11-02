import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { BigButton } from '../big-button/big-button';

@Component({
  selector: 'app-header',
  imports: [BigButton],
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
