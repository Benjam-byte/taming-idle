import { Component, inject, Input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';

@Component({
    selector: 'app-rename-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './rename-modal.component.html',
    styleUrls: ['./rename-modal.component.scss'],
})
export class RenameModalComponent {
    modalCtrl = inject(ModalController);
    fb = inject(FormBuilder);
    @Input() oldName!: string;

    form = this.fb.group({
        username: [this.oldName, [Validators.minLength(3)]],
    });

    close() {
        this.modalCtrl.dismiss();
    }

    onSubmit() {
        this.modalCtrl.dismiss(this.form.value.username);
    }
}
