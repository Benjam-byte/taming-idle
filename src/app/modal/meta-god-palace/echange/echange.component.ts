import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-echange',
    templateUrl: './echange.component.html',
    styleUrls: ['./echange.component.scss'],
})
export class EchangeComponent {
    modalCtrl = inject(ModalController);
    constructor() {}

    close() {
        this.modalCtrl.dismiss();
    }
}
