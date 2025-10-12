import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
@Component({
    selector: 'app-modal-layout',
    imports: [IonContent],
    templateUrl: './modal-layout.component.html',
    styleUrl: './modal-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalLayoutComponent {
    modalCtrl = inject(ModalController);

    close() {
        this.modalCtrl.dismiss();
    }
}
