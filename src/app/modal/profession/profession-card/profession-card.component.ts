import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    signal,
} from '@angular/core';
import { XpRangeComponent } from '../xp-range/xp-range.component';
import { Profession } from 'src/app/database/profession/profession.type';
import { statIconDict, StatKey } from 'src/app/core/config/statIconDict';
import { RoundToPipe } from '../../../core/pipe/roundTo.pipe';
import { calculateMathFunction } from 'src/app/core/helpers/function/function';

type Tier = 10 | 20 | 30;

@Component({
    selector: 'app-profession-card',
    imports: [XpRangeComponent, RoundToPipe],
    templateUrl: './profession-card.component.html',
    styleUrl: './profession-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionCardComponent {
    profession = input.required<Profession>();
    level = input.required<number>();
    xp = input.required<number>();
    statIconDict = statIconDict;

    descriptionIsVisible = signal<boolean>(false);

    professionCap = computed(() => {
        const profession = this.profession();
        return calculateMathFunction(profession.function, this.level());
    });

    professionImage = computed(() => {
        const imageIndex = this.mapNumber(this.level());
        return this.profession().image[imageIndex as Tier];
    });

    professionStatGain = computed(() => {
        const level = this.level() - 1;
        const value = this.profession().value.value * level;
        if (value < 0) return value;
        return '+' + value;
    });

    statIcon = computed(
        () => this.statIconDict[this.profession().value.stat as StatKey]
    );

    setDescription() {
        this.descriptionIsVisible.set(!this.descriptionIsVisible());
    }

    private mapNumber(n: number): number {
        if (n <= 10) return 10;
        if (n <= 20) return 20;
        return 30;
    }
}
