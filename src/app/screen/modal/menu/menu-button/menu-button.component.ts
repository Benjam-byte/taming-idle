import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';

@Component({
  selector: 'app-menu-button',
  standalone: true,
  imports: [IconButtonComponent],
  templateUrl: './menu-button.component.html',
  styleUrl: './menu-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuButtonComponent {
  readonly label = input.required<string>();
  readonly iconSrc = input.required<string>();
  readonly disabled = input(false);

  readonly selected = output<void>();

  readonly displayedIconSrc = computed(() =>
    this.disabled() ? 'assets/icon/question.png' : this.iconSrc(),
  );

  press(): void {
    if (this.disabled()) {
      return;
    }

    this.selected.emit();
  }
}
