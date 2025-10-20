import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { BestiaryManagerService } from 'src/app/core/service/monster/bestiary-manager.service';

@Component({
    selector: 'app-collect-egg',
    imports: [],
    templateUrl: './collect-egg.component.html',
    styleUrl: './collect-egg.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectEggComponent {
    @Input() name!: string;
    bestiaryManagerService = inject(BestiaryManagerService);
    modalCtrl = inject(ModalController);

    close() {
        this.modalCtrl.dismiss(false);
    }

    confirm() {
        this.modalCtrl.dismiss(true);
    }

    getImageFromName(name: string) {
        return this.bestiaryManagerService.getMonsterByName(name)?.image.base;
    }
}
