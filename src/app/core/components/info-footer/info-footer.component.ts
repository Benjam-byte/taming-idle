import { Component, effect, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { MenuComponent } from 'src/app/modal/menu/menu.component';
import { WorldManagerService } from '../../service/location/world.service';
import { RegionStatPage } from 'src/app/modal/region-stat/region-stat.page';

type InformationMode = 'fight' | 'loot' | 'world' | 'monster';

@Component({
    selector: 'app-info-footer',
    imports: [CommonModule],
    templateUrl: './info-footer.component.html',
    styleUrl: './info-footer.component.scss',
})
export class InfoFooterComponent {
    ressourceVisible = output<boolean>();
    worldManager = inject(WorldManagerService);
    modalCtrl = inject(ModalController);

    isRessourceTouched = signal(false);

    constructor() {
        effect(() => this.ressourceVisible.emit(this.isRessourceTouched()));
    }

    ressourceTouched(ev?: Event) {
        ev?.preventDefault();
        ev?.stopPropagation();
        this.isRessourceTouched.set(true);
    }

    ressourceUnTouched(ev?: Event) {
        ev?.preventDefault();
        ev?.stopPropagation();
        this.isRessourceTouched.set(false);
    }

    disableContext(event: Event) {
        event.preventDefault();
        event.stopPropagation();
    }

    async openMenuModal() {
        const modal = await this.modalCtrl.create({
            component: MenuComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    async openRegionModal() {
        const modal = await this.modalCtrl.create({
            component: RegionStatPage,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }
}
