import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  Input,
  output,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-attack-button',
  imports: [],
  templateUrl: './attack-button.component.html',
  styleUrl: './attack-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttackButtonComponent {
  click = output();
  cdr = inject(ChangeDetectorRef);
  @Input() countdown$?: Observable<number>;
  duration = input<number>(800);
  value = input<string>('Start');

  private sub!: Subscription;

  progress = 100;

  onClick() {
    this.click.emit();
  }

  ngOnInit() {
    if (!this.countdown$) return;
    this.sub = this.countdown$.subscribe((remaining) => {
      const pct = 100 - (remaining / (this.duration() - 100)) * 100;
      this.progress = Math.min(100, Math.max(0, pct));
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
