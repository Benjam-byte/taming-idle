import {
  ChangeDetectionStrategy,
  Component,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  imports: [],
  templateUrl: 'progress-bar.component.html',
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {
  duration = input<number>();
}
