import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { metaGodMessageList } from 'src/app/core/config/metaGodMessage';
import { EchangeComponent } from './echange/echange.component';

@Component({
    selector: 'app-meta-god-palace',
    imports: [CommonModule],
    templateUrl: './meta-god-palace.component.html',
    styleUrl: './meta-god-palace.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaGodPalaceComponent {
    godMessageList = metaGodMessageList;
    modalCtrl = inject(ModalController);

    randomMessageIndex = signal<number>(
        Math.floor(Math.random() * this.godMessageList.length)
    );

    message = computed(() => this.godMessageList[this.randomMessageIndex()]);

    close() {
        this.modalCtrl.dismiss();
    }

    async openEchangeModal() {
        console.log(this.randomMessageIndex());
        const modal = await this.modalCtrl.create({
            component: EchangeComponent,
            cssClass: 'medium-modal',
            backdropDismiss: false,
            showBackdrop: true,
        });

        modal.present();
    }
}
