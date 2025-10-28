import { Component, effect, inject, signal } from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { EmptyAreaComponent } from './empty-area/empty-area.component';
import { TresorAreaComponent } from './tresor-area/tresor-area.component';
import { MonsterAreaComponent } from './monster-area/monster-area.component';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { InfoBarComponent } from 'src/app/core/components/info-bar/info-bar.component';
import { CommonModule } from '@angular/common';
import { InfoFooterComponent } from 'src/app/core/components/info-footer/info-footer.component';
import { MapManagerService } from 'src/app/core/service/location/map.service';
import { ProfessionComponent } from 'src/app/modal/profession/profession.component';
import { RessourcePanelComponent } from './ressource-panel/ressource-panel.component';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { AutoPilotService } from 'src/app/core/service/auto-pilot';
import { FlashOverlayComponent } from 'src/app/core/components/flash-overlay/flash-overlay.component';

@Component({
    selector: 'app-exploration',
    templateUrl: 'exploration.page.html',
    styleUrls: ['exploration.page.scss'],
    imports: [
        CommonModule,
        IonContent,
        EmptyAreaComponent,
        TresorAreaComponent,
        MonsterAreaComponent,
        InfoBarComponent,
        InfoFooterComponent,
        RessourcePanelComponent,
        FlashOverlayComponent,
    ],
})
export class ExplorationPage {
    gameEngineService = inject(GameEngineService);
    mapService = inject(MapManagerService);
    modalCtrl = inject(ModalController);
    lootManagerService = inject(LootManagerService);
    autoPilot = inject(AutoPilotService);
    currentMap = this.mapService.map;

    travelCountDown$ = this.gameEngineService.getTravelCountDown$();
    fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

    images = [
        'assets/map/plaine/Plaine_1.webp',
        'assets/map/plaine/Plaine_2.webp',
        'assets/map/plaine/Plaine_3.webp',
        'assets/map/plaine/Plaine_4.webp',
        'assets/map/plaine/Plaine_5.webp',
        'assets/map/plaine/Plaine_6.webp',
    ];

    imageUrl = '';
    previousImageUrl: string | null = null;
    imageLoaded = false;
    isRessourceVisible = signal(false);

    constructor() {
        effect(() => {
            const value = this.currentMap();
            if (value) this.changeBackgroundImage(this.getRandomImage());
        });
    }

    getRandomImage(): string {
        const index = Math.floor(Math.random() * this.images.length);
        return this.images[index];
    }

    changeBackgroundImage(newUrl: string) {
        this.previousImageUrl = this.imageUrl;
        this.imageUrl = newUrl;
        this.imageLoaded = false;
    }

    onImageLoad() {
        this.imageLoaded = true;

        setTimeout(() => {
            this.previousImageUrl = null;
        }, 100);
    }

    async openProfessionModal() {
        const modal = await this.modalCtrl.create({
            component: ProfessionComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    emitEvent(event: string) {
        this.gameEngineService.submitEventByType(event);
    }

    setRessource(isVisible: boolean) {
        this.isRessourceVisible.set(isVisible);
    }
}
