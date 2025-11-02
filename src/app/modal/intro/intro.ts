import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { introTextList } from 'src/app/core/config/intro';

@Component({
    selector: 'intro-list',
    templateUrl: './intro.html',
    styleUrls: ['./intro.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
})
export class IntroPage {
    introTextlist = introTextList;
    modalCtrl = inject(ModalController);
    index = signal<number>(0);

    imagePath = computed(() => `assets/intro/${this.index()}.png`);
    paragraphe = computed(() => introTextList[this.index()]);

    onClick() {
        if (this.index() === 8) {
            this.modalCtrl.dismiss(true);
        } else {
            this.index.update((v) => v + 1);
        }
    }
}
