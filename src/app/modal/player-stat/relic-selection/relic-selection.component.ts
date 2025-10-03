import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    signal,
} from '@angular/core';
import { Relics } from 'src/app/database/relics/relics.type';
import { ModalController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-relic-selection',
    imports: [],
    templateUrl: './relic-selection.component.html',
    styleUrl: './relic-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelicSelectionComponent {
    modalCtrl = inject(ModalController);
    @Input() relicList!: Relics[];
    selectedId = signal('');

    select(id: string) {
        this.selectedId.set(id);
    }

    close() {
        this.modalCtrl.dismiss();
    }

    associate(id: string) {
        const relic = this.relicList.find((relic) => relic.id === id);
        this.modalCtrl.dismiss(relic);
    }
}
