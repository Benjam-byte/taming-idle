import { ElementRef, inject, Injectable, signal } from '@angular/core';
import { ResourceType } from 'src/app/core/enum/resource.enum';
import { EggManagerService } from 'src/app/core/service/monster/egg-manager.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { Egg } from 'src/app/database/egg/egg.type';

interface Position {
    top: string;
    left: string;
}

@Injectable({
    providedIn: 'root',
})
export class GatherFacade {
    lootManager = inject(LootManagerService);
    eggManagerService = inject(EggManagerService);
    clickEffectService = inject(ClickEffectService);

    egg = signal<Omit<Egg, 'id'> | null>(null);
    eggPosition = signal<Position>({ top: '0px', left: '0px' });
    loot = signal<{ resource: string; quantity: number }>({
        resource: 'Wheat',
        quantity: 0,
    });
    lootPosition = signal<Position>({ top: '0px', left: '0px' });

    host = signal<ElementRef<HTMLElement> | null>(null);

    setHost(el: ElementRef<HTMLElement> | null): void {
        this.host.set(el);
    }

    updateEgg() {
        const host = this.host();
        if (!host) return;
        this.eggPosition.set(
            this.getRandomPositionStyle(
                host.nativeElement.getBoundingClientRect().width,
                host.nativeElement.getBoundingClientRect().height
            )
        );
        this.egg.set(this.eggManagerService.rollOneEgg());
    }

    collectEgg(event: MouseEvent) {
        if (this.egg()) {
            this.clickEffectService.spawnCollectEggEffect(event, 1);
            this.eggManagerService
                .addOneEgg$(this.egg() as Egg)
                .subscribe(() => this.egg.set(null));
        }
    }

    collectEggFromAuto() {
        if (this.egg()) {
            this.clickEffectService.spawnCollectEggEffectFromAuto(
                {
                    x: this.fromCssToNumber(this.lootPosition()?.left ?? '0px'),
                    y: this.fromCssToNumber(this.lootPosition()?.top ?? '0px'),
                },
                1
            );
            this.eggManagerService
                .addOneEgg$(this.egg() as Egg)
                .subscribe(() => this.egg.set(null));
        }
    }

    updateWheat() {
        const host = this.host();
        if (!host) return;
        this.lootPosition.set(
            this.getRandomPositionStyle(
                host.nativeElement.getBoundingClientRect().width,
                host.nativeElement.getBoundingClientRect().height
            )
        );
        this.loot.set(this.lootManager.getResource());
    }

    collectWheat(event: MouseEvent) {
        if (this.loot().quantity > 0) {
            const quantity = this.loot().quantity;
            this.clickEffectService.spawnCollectEffect(event, quantity);
            this.loot.set({ resource: this.loot().resource, quantity: 0 });
            if (this.loot().resource === ResourceType.Wheat)
                this.lootManager.addWheat$(quantity).subscribe();
            if (this.loot().resource === ResourceType.EnchantedWheat)
                this.lootManager.addEnchantedWheat$(quantity).subscribe();
        }
    }

    collectWheatFromAuto() {
        if (this.loot().quantity > 0) {
            const quantity = this.loot().quantity;
            this.clickEffectService.spawnCollectEffectFromAuto(
                {
                    x: this.fromCssToNumber(this.lootPosition()?.left ?? '0px'),
                    y: this.fromCssToNumber(this.lootPosition()?.top ?? '0px'),
                },
                quantity
            );
            this.loot.set({ resource: this.loot().resource, quantity: 0 });
            if (this.loot().resource === ResourceType.Wheat)
                this.lootManager.addWheat$(quantity).subscribe();
            if (this.loot().resource === ResourceType.EnchantedWheat)
                this.lootManager.addEnchantedWheat$(quantity).subscribe();
        }
    }

    private getRandomPositionStyle(
        viewportW: number,
        viewportH: number,
        pad = 16
    ) {
        const BOX_W = 120;
        const BOX_H = 120;

        let maxLeft = Math.max(0, viewportW - BOX_W - pad * 2);
        let maxTop = Math.max(0, viewportH - BOX_H - pad * 2);

        if (maxLeft === 0) maxLeft = Math.random() * 300;
        if (maxTop === 0) maxTop = Math.random() * 400;

        const left = pad + Math.random() * maxLeft;
        const top = pad + Math.random() * maxTop;

        const leftCss = `${left.toFixed(0)}px`;
        const topCss = `${top.toFixed(0)}px`;

        return { left: leftCss, top: topCss };
    }

    private fromCssToNumber(value: string): number {
        return Number(value.replace('px', ''));
    }
}
