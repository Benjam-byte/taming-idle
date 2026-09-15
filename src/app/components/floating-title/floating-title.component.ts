import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-floating-title',
  standalone: true,
  templateUrl: './floating-title.component.html',
  styleUrl: './floating-title.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingTitleComponent {
  readonly text = input.required<string>();

  readonly back = output<void>();
}
