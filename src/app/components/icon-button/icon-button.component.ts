import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export type IconButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-icon-button',
  standalone: true,
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconButtonComponent {
  readonly size = input<IconButtonSize>('sm');
  readonly label = input('');
  readonly disabled = input(false);

  readonly pressed = output<MouseEvent>();
}
