import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { TamedMonsterManagerService } from 'src/app/core/service/monster/tamed-monster-manager.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { statIconDict } from 'src/app/core/config/statIconDict';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';
import { ModalController } from '@ionic/angular/standalone';
import { MonsterStatPage } from '../monster-stat/monster-stat.page';

@Component({
    selector: 'app-stable',
    imports: [ModalLayoutComponent, XpRangeComponent],
    templateUrl: './stable.component.html',
    styleUrl: './stable.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StableComponent {
    modalCtrl = inject(ModalController);
    tamedMonsterManager = inject(TamedMonsterManagerService);
    tamedMonsterList = toSignal(this.tamedMonsterManager.tamedMonsterList$);

    readonly selectedId = signal<string | undefined>(undefined);

    selectedMonster = computed(() =>
        this.tamedMonsterList()?.find(
            (tamedMonster) => tamedMonster.id === this.selectedId()
        )
    );
    statIconDict = statIconDict;

    select(monster: TamedMonster) {
        if (monster.id === this.selectedId()) {
            this.selectedId.set(undefined);
            return;
        }
        this.selectedId.set(monster.id);
    }

    getImage(name: string) {
        return this.tamedMonsterManager.getImageFromMonster(name);
    }

    async openMonsterModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: MonsterStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
            componentProps: {
                monsterId: this.selectedId(),
            },
        });

        modal.present();
    }
}
