import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { BestiaryManagerService } from 'src/app/core/service/monster/bestiary-manager.service';

@Component({
    selector: 'app-bestiary',
    imports: [IonContent],
    templateUrl: './bestiary.component.html',
    styleUrl: './bestiary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestiaryComponent {
    modalCtrl = inject(ModalController);
    bestiaryManagerService = inject(BestiaryManagerService);

    monsterList = toSignal(this.bestiaryManagerService.bestiaryList$);

    close() {
        this.modalCtrl.dismiss();
    }
}
