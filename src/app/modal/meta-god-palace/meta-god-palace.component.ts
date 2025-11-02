import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { metaGodMessageList } from 'src/app/core/config/metaGodMessage';

@Component({
    selector: 'app-meta-god-palace',
    imports: [IonContent, CommonModule],
    templateUrl: './meta-god-palace.component.html',
    styleUrl: './meta-god-palace.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaGodPalaceComponent {
    godMessageList = metaGodMessageList;
    modalCtrl = inject(ModalController);

    randomMessageIndex = signal<number>(
        Math.floor(Math.random() * (this.godMessageList.length + 1))
    );

    message = computed(() => this.godMessageList[this.randomMessageIndex()]);

    close() {
        this.modalCtrl.dismiss();
    }
}
