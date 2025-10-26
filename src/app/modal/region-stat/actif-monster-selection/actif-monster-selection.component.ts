import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    signal,
} from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { BestiaryManagerService } from 'src/app/core/service/monster/bestiary-manager.service';

@Component({
    selector: 'app-actif-monster-selection',
    imports: [],
    templateUrl: './actif-monster-selection.component.html',
    styleUrl: './actif-monster-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActifMonsterSelectionComponent {
    bestiaryManager = inject(BestiaryManagerService);
    modalCtrl = inject(ModalController);
    @Input() tamedMonsterList!: TamedMonster[];
    selectedId = signal('');

    select(id: string) {
        this.selectedId.set(id);
    }

    close() {
        this.modalCtrl.dismiss();
    }

    associate(id: string) {
        this.modalCtrl.dismiss(id);
    }

    getImageFromMonster(name: string) {
        const monsterProfile = this.bestiaryManager.getMonsterByName(name);
        if (!monsterProfile) throw new Error('monster not found');
        return monsterProfile.image.base;
    }
}
