import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
} from '@angular/core';

@Component({
    selector: 'app-xp-range',
    imports: [],
    templateUrl: './xp-range.component.html',
    styleUrl: './xp-range.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class XpRangeComponent {
    currentXp = input.required<number>();
    maxXp = input.required<number>();

    currentFormatedXp = computed(
        () => Math.round((this.currentXp() + Number.EPSILON) * 10) / 10
    );

    progress = computed(() => {
        const value = (this.currentXp() / this.maxXp()) * 100;
        return Math.min(100, Math.max(0, value));
    });
}
