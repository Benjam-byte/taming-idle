import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { WorldMapComponent } from '../world-map/world-map.component';
import { RelicListPage } from '../relic-list/relic-list.page';
import { GodPalaceComponent } from '../god-palace/god-palace.component';
import { ProfessionComponent } from '../profession/profession.component';
import { WorldManagerService } from 'src/app/core/service/location/world.service';
import { FightTowerComponent } from '../fight-tower/fight-tower.component';
import { PlayerStatPage } from '../player-stat/player-stat.page';
import { RegionStatPage } from '../region-stat/region-stat.page';
import { MenuButtonComponent } from './menu-button/menu-button.component';
import { BestiaryComponent } from '../bestiary/bestiary.component';
import { CommonModule } from '@angular/common';
import { IncubateurPage } from '../incubateur/incubateur.page';
import { StableComponent } from '../stable/stable.component';

@Component({
    selector: 'app-menu',
    imports: [IonContent, MenuButtonComponent, CommonModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
    modalCtrl = inject(ModalController);
    worldService = inject(WorldManagerService);

    closeMenuModal() {
        this.modalCtrl.dismiss();
    }

    async openStableModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: StableComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openIncubateurModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: IncubateurPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openWorldMapModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: WorldMapComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openCombatTowerModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: FightTowerComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openPlayerStat() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: PlayerStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openRelicListModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: RelicListPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openRegionStat() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: RegionStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openGodPalaceModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: GodPalaceComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openProfessionModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: ProfessionComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openBestiaryModal() {
        this.modalCtrl.dismiss();
        const modal = await this.modalCtrl.create({
            component: BestiaryComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
