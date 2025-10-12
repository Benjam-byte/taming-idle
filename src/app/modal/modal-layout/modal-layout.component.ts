import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { MenuComponent } from '../menu/menu.component';
@Component({
    selector: 'app-modal-layout',
    imports: [],
    templateUrl: './modal-layout.component.html',
    styleUrl: './modal-layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalLayoutComponent {
    modalCtrl = inject(ModalController);
    title = input.required();

    close() {
        this.modalCtrl.dismiss();
    }

    async goToMenu() {
        this.close();
        const modal = await this.modalCtrl.create({
            component: MenuComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
