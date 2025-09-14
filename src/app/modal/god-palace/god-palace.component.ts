import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { WorldMapComponent } from '../world-map/world-map.component';
import { MetaGodPalaceComponent } from '../meta-god-palace/meta-god-palace.component';
import { GodPalaceManagerService } from 'src/app/core/service/location/god-palace.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { God } from 'src/app/database/god/god.type';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { RegionManagerService } from 'src/app/core/service/location/region.service';
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';
import { costGeomInt } from 'src/app/core/helpers/cost-function';
import { WorldManagerService } from 'src/app/core/service/location/world.service';
import { of, switchMap, tap } from 'rxjs';

@Component({
    selector: 'app-god-palace',
    imports: [IonContent, CommonModule],
    templateUrl: './god-palace.component.html',
    styleUrl: './god-palace.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GodPalaceComponent {
    modalCtrl = inject(ModalController);
    godPalaceService = inject(GodPalaceManagerService);
    lootService = inject(LootManagerService);
    worldService = inject(WorldManagerService);
    broadcastService = inject(BroadcastService);
    regionService = inject(RegionManagerService);
    clickEffectService = inject(ClickEffectService);

    readonly godList = toSignal(this.godPalaceService.godList$, {
        initialValue: [],
    });
    readonly selectedIndex = signal(0);
    readonly selectedGod = computed(() => {
        const godList = this.godList();
        const selectedIndex = this.selectedIndex();
        if (!godList) return;
        return godList[selectedIndex];
    });

    readonly lootValue = toSignal(
        toObservable(this.selectedGod).pipe(
            switchMap((selectedGod) => {
                console.log(selectedGod);
                if (!selectedGod) return of(0);
                return this.lootService
                    .getCorrectValueFromRessource$(
                        selectedGod.offering.ressource
                    )
                    .pipe(tap(console.log));
            })
        ),
        { initialValue: 0 }
    );

    close() {
        this.modalCtrl.dismiss();
    }

    next(): void {
        const current = this.selectedIndex();
        const total = this.godPalaceService.godList.length;
        this.selectedIndex.update(() => (current + 1) % total);
    }

    openWorldMapModal() {
        this.close();
        this.openWorldModal();
    }

    async openWorldModal() {
        const modal = await this.modalCtrl.create({
            component: WorldMapComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    goToMetaPalace() {
        const selectedGod = this.selectedGod();
        if (selectedGod) {
            if (!this.worldService.world.metaGodAvailable) return;
            if (selectedGod.name !== 'Meta fracture') return;
            this.close();
            this.openMetaGodModal();
        }
    }

    async openMetaGodModal() {
        const modal = await this.modalCtrl.create({
            component: MetaGodPalaceComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: true,
            showBackdrop: true,
        });

        modal.present();
    }

    getPrice(selectedGod: God) {
        return costGeomInt(
            selectedGod.level,
            selectedGod.offering.price,
            this.worldService.world.geometricLootRatio
        );
    }

    offer(selectedGod: God) {
        switch (selectedGod.name) {
            case "Dieu de l'aventure":
                this.offerToTravelerGod(selectedGod);
                break;
            case 'Dieu du combat':
                this.offerToFighterGod(selectedGod);
                break;
            case 'Dieu de la malice':
                this.offerToMaliceGod(selectedGod);
                break;
            case 'Dieu de la récolte':
                this.offerToGatheringGod(selectedGod);
        }
    }

    offerToTravelerGod(selectedGod: God) {
        this.lootService
            .paidWheat$(this.getPrice(selectedGod))
            ?.subscribe(() => {
                this.regionService.updateSelectedRegionLootDropPercentage(
                    selectedGod.offering.statGain
                );
                this.godPalaceService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Les champs sont maintenant plus fertile',
                });
            });
    }

    offerToGatheringGod(selectedGod: God) {
        this.lootService
            .paidEnchantedWheat$(selectedGod.offering.price)
            ?.subscribe(() => {
                this.regionService.updateSelectedRegionShinyLootDropPercentage(
                    selectedGod.offering.statGain
                );
                this.godPalaceService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Les champs sont maintenant plus fertile',
                });
            });
    }

    offerToMaliceGod(selectedGod: God) {
        this.lootService
            .paidEnchantedSlimeSoul$(selectedGod.offering.price)
            ?.subscribe(() => {
                this.worldService.addNextRegion$();
                this.godPalaceService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Un nouveau continent est disponible',
                });
            });
    }

    offerToFighterGod(selectedGod: God) {
        this.lootService
            .paidSlimeSoul$(selectedGod.offering.price)
            ?.subscribe(() => {
                this.regionService
                    .updateSelectedRegionMonsterSpawnRate$(
                        selectedGod.offering.statGain
                    )
                    .subscribe();
                this.godPalaceService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Les monstres se reproduisent plus vite',
                });
            });
    }
}
