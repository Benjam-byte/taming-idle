import {
    ChangeDetectionStrategy,
    Component,
    inject,
    input,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-modal-layout',
    imports: [],
    templateUrl: './modal-layout.component.html',
    styleUrl: './modal-layout.component.scss',
    standalone: true,
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
        const { MenuComponent } = await import('../menu/menu.component');
        const modal = await this.modalCtrl.create({
            component: MenuComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
