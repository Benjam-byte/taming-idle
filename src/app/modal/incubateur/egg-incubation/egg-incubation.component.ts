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
    selector: 'app-egg-incubation',
    imports: [],
    templateUrl: './egg-incubation.component.html',
    styleUrl: './egg-incubation.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EggIncubationComponent {
    modalCtrl = inject(ModalController);

    close() {
        this.modalCtrl.dismiss(false);
    }

    confirm() {
        this.modalCtrl.dismiss(true);
    }
}
