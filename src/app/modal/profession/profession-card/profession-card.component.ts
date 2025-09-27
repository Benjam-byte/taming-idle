import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    signal,
} from '@angular/core';
import { XpRangeComponent } from '../xp-range/xp-range.component';
import { Profession } from 'src/app/database/profession/profession.type';
import { statIconDict, StatKey } from 'src/app/core/json/statIconDict';

type Tier = 10 | 20 | 30;

@Component({
    selector: 'app-profession-card',
    imports: [XpRangeComponent],
    templateUrl: './profession-card.component.html',
    styleUrl: './profession-card.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionCardComponent {
    profession = input.required<Profession>();
    statIconDict = statIconDict;

    descriptionIsVisible = signal<boolean>(false);

    professionCap = computed(() => 1 * this.profession().level);

    professionImage = computed(() => {
        const imageIndex = this.mapNumber(this.profession().level);
        return this.profession().image[imageIndex as Tier];
    });

    professionStatGain = computed(() => {
        if (this.profession().level === 1) return 0;
        const value = this.profession().value.value * this.profession().level;
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
