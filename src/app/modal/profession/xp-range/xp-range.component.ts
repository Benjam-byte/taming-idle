import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
} from '@angular/core';
import { RoundToPipe } from '../../../core/pipe/roundTo.pipe';

@Component({
    selector: 'app-xp-range',
    imports: [RoundToPipe],
    templateUrl: './xp-range.component.html',
    styleUrl: './xp-range.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XpRangeComponent {
    currentXp = input.required<number>();
    maxXp = input.required<number>();

    progress = computed(() => {
        const value = (this.currentXp() / this.maxXp()) * 100;
        return Math.min(100, Math.max(0, value));
    });
}
