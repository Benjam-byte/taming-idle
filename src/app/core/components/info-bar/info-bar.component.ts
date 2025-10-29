import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LootManagerService } from '../../service/player/loot-manager.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { PlayerStatPage } from 'src/app/modal/player-stat/player-stat.page';
import { CombatTowerManagerService } from '../../service/location/combat-tower.service';
import { RoundToPipe } from '../../pipe/roundTo.pipe';
import { RegionManagerService } from '../../service/location/region.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TamedMonsterManagerService } from '../../service/monster/tamed-monster-manager.service';
import { AssignedMonsterManagerService } from '../../service/player/assigned-monster-manager.service';
import { MonsterStatPage } from 'src/app/modal/monster-stat/monster-stat.page';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';

@Component({
    selector: 'app-info-bar',
    imports: [CommonModule, RoundToPipe],
    templateUrl: './info-bar.component.html',
    styleUrl: './info-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoBarComponent {
    modalCtrl = inject(ModalController);
    lootManagerService = inject(LootManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    tamedMonsterManager = inject(TamedMonsterManagerService);
    combatTowerManagerService = inject(CombatTowerManagerService);

    assignedMonster = toSignal(this.assignedMonsterManager.assignedMonster$);

    openInfoModal() {
        if (
            this.assignedMonsterManager.assignedMonster.monsterSpecies ===
            'Terra larva'
        ) {
            this.openPlayerModal();
            return;
        }
        this.openMonsterModal();
    }

    async openMonsterModal() {
        const modal = await this.modalCtrl.create({
            component: MonsterStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
            componentProps: {
                monsterId: this.assignedMonsterManager.assignedMonster.id,
            },
        });

        modal.present();
    }

    async openPlayerModal() {
        const modal = await this.modalCtrl.create({
            component: PlayerStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
            componentProps: {
                monsterId: this.assignedMonsterManager.assignedMonster.id,
            },
        });

        modal.present();
    }

    getImage(name: string) {
        return this.tamedMonsterManager.getImageFromMonster(name);
    }

    getMonsterLevel(monster: TamedMonster) {
        return monster.availableProfession.reduce(
            (acc, profession) => acc + profession.level,
            0
        );
    }
}
