import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  input,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-icon-progress',
  imports: [CommonModule],
  templateUrl: './icon-progress.component.html',
  styleUrl: './icon-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconProgressComponent {
  cdr = inject(ChangeDetectorRef);
  @Input() countdown$!: Observable<number>;
  duration = input<number>(800);
  type = input<'travel' | 'fight' | 'search'>('travel');

  progress = 0;
  private sub!: Subscription;

  getImageSrc() {
    if (this.type() === 'travel') return 'assets/icon/footsteps.png';
    if (this.type() === 'fight') return 'assets/icon/sword.png';
    return 'assets/icon/loupe.png';
  }

  ngOnInit() {
    this.sub = this.countdown$.subscribe((remaining) => {
      const pct = 100 - (remaining / this.duration()) * 100;
      this.progress = Math.min(100, Math.max(0, pct));
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
