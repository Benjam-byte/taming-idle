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
    regionManagerService = inject(RegionManagerService);
    tamedMonsterManagerService = inject(TamedMonsterManagerService);
    combatTowerManagerService = inject(CombatTowerManagerService);

    assignedMonster = toSignal(this.regionManagerService.assignedMonster$());

    async openPlayerModal() {
        const modal = await this.modalCtrl.create({
            component: PlayerStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    getImage(name: string) {
        return this.tamedMonsterManagerService.getImageFromMonster(name);
    }
}
