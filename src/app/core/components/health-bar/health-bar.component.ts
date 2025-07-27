import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-health-bar',
  imports: [],
  templateUrl: './health-bar.component.html',
  styleUrl: './health-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HealthBarComponent {
  max = input<number>(100);
  current = input<number>(100);

  get percentage(): number {
    return Math.max(0, Math.min(100, (this.current() / this.max()) * 100));
  }
}
