import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { MonsterType } from 'src/app/database/bestiary/bestiary.type';

@Component({
    selector: 'app-stable',
    imports: [ModalLayoutComponent],
    templateUrl: './stable.component.html',
    styleUrl: './stable.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StableComponent {
    readonly selectedId = signal<string | undefined>(undefined);

    select(monster: MonsterType) {
        if (monster === this.selectedId()) {
            this.selectedId.set(undefined);
            return;
        }
        this.selectedId.set(monster);
    }
}
