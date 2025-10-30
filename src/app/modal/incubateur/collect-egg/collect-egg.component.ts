import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { BestiaryManagerService } from 'src/app/core/service/monster/bestiary-manager.service';

@Component({
    selector: 'app-collect-egg',
    imports: [ReactiveFormsModule],
    templateUrl: './collect-egg.component.html',
    styleUrl: './collect-egg.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectEggComponent {
    @Input() name!: string;
    bestiaryManagerService = inject(BestiaryManagerService);
    modalCtrl = inject(ModalController);
    fb = inject(FormBuilder);

    form = this.fb.group({
        username: [this.name, [Validators.minLength(1)]],
    });

    close() {
        this.modalCtrl.dismiss();
    }

    getImageFromName(name: string) {
        return this.bestiaryManagerService.getMonsterByName(name)?.image.base;
    }

    onSubmit() {
        this.modalCtrl.dismiss(this.form.value.username);
    }
}
