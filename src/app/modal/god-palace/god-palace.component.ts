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
import { GodManagerService } from 'src/app/core/service/location/god-palace.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { God } from 'src/app/database/god/god.type';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { RegionManagerService } from 'src/app/core/service/location/region.service';
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';
import { WorldManagerService } from 'src/app/core/service/location/world.service';
import { concatMap, of, switchMap, tap } from 'rxjs';
import { calculateMathFunction } from 'src/app/core/helpers/function/function';

@Component({
    selector: 'app-god-palace',
    imports: [IonContent, CommonModule],
    templateUrl: './god-palace.component.html',
    styleUrl: './god-palace.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GodPalaceComponent {
    modalCtrl = inject(ModalController);
    godManagerService = inject(GodManagerService);
    lootService = inject(LootManagerService);
    worldService = inject(WorldManagerService);
    broadcastService = inject(BroadcastService);
    regionService = inject(RegionManagerService);
    clickEffectService = inject(ClickEffectService);

    readonly godList = toSignal(this.godManagerService.godList$, {
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
                if (!selectedGod) return of(0);
                return this.lootService.getCorrectValueFromRessource$(
                    selectedGod.cost.resource
                );
            })
        ),
        { initialValue: 0 }
    );

    close() {
        this.modalCtrl.dismiss();
    }

    next(): void {
        const current = this.selectedIndex();
        const total = this.godManagerService.godList.length;
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
        return calculateMathFunction(
            selectedGod.cost.function,
            selectedGod.level
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
            case 'Dieu des champs':
                this.offerToFieldGod(selectedGod);
        }
    }

    offerToTravelerGod(selectedGod: God) {
        this.lootService
            .paidEnchantedWheat$(this.getPrice(selectedGod))
            ?.pipe(
                concatMap(() =>
                    this.regionService.updateExistingMonsterType$(
                        (selectedGod.gain.value as string[])[selectedGod.level]
                    )
                )
            )
            .subscribe(() => {
                this.godManagerService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Plus de monstre enchantés',
                });
            });
    }

    offerToFieldGod(selectedGod: God) {
        this.lootService
            .paidSoul$(this.getPrice(selectedGod))
            ?.pipe(
                concatMap(() =>
                    this.regionService.updateSelectedRegionWheatDropPercentage$(
                        selectedGod.gain.value as number
                    )
                )
            )
            .subscribe(() => {
                this.godManagerService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Plus de blé dans les champs',
                });
            });
    }

    offerToFighterGod(selectedGod: God) {
        this.lootService
            .paidWheat$(this.getPrice(selectedGod))
            ?.pipe(
                concatMap(() =>
                    this.regionService.updateSelectedRegionEnchantedMonsterRate$(
                        selectedGod.gain.value as number
                    )
                )
            )
            .subscribe(() => {
                this.godManagerService.updateGodLevel(selectedGod);
                this.broadcastService.displayMessage({
                    message: 'Plus de monstre enchantés',
                });
            });
    }
}
