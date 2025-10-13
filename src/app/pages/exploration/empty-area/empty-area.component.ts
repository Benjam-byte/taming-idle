import {
    Component,
    computed,
    effect,
    ElementRef,
    inject,
    signal,
} from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MapManagerService } from 'src/app/core/service/location/map.service';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';

@Component({
    selector: 'app-empty-area',
    templateUrl: './empty-area.component.html',
    styleUrls: ['./empty-area.component.scss'],
    imports: [],
})
export class EmptyAreaComponent {
    gameEngineService = inject(GameEngineService);
    lootManagerService = inject(LootManagerService);
    clickEffectService = inject(ClickEffectService);
    broadcastMessageService = inject(BroadcastService);
    mapManagerService = inject(MapManagerService);
    humanManagerService = inject(HumanManagerService);

    host = inject(ElementRef<HTMLElement>);
    position!: { top: string; left: string };
    loot!: { resource: string; quantity: number };

    countDown = toSignal(this.gameEngineService.getTravelCountDown$());
    isActive = computed(() => this.countDown() === 0);

    showRightSucces = signal(false);
    showLeftSucces = signal(false);
    showTopSucces = signal(false);

    isFadingRight = computed(() => {
        if (this.showRightSucces()) return true;
        return this.isActive();
    });
    isFadingLeft = computed(() => {
        if (this.showLeftSucces()) return true;
        return this.isActive();
    });
    isFadingTop = computed(() => {
        if (this.showTopSucces()) return false;
        return this.isActive();
    });

    rightArrowImage = computed(() => {
        const map = this.humanManagerService.trackDirection(
            this.mapManagerService.availableMap().right
        );
        return this.getArrowPath('right', map);
    });
    leftArrowImage = computed(() => {
        const map = this.humanManagerService.trackDirection(
            this.mapManagerService.availableMap().left
        );
        return this.getArrowPath('left', map);
    });
    topArrowImage = computed(() => {
        const map = this.humanManagerService.trackDirection(
            this.mapManagerService.availableMap().top
        );
        return this.getArrowPath('top', map);
    });

    constructor() {
        effect(() => {
            this.mapManagerService.map();
            this.createWheat();
        });
    }

    createWheat() {
        this.position = this.getRandomPositionStyle(
            this.host.nativeElement.getBoundingClientRect().width,
            this.host.nativeElement.getBoundingClientRect().height
        );
        this.loot = this.lootManagerService.getResource();
    }

    travel(value: string) {
        this.activateSuccesForArrow(value);
        this.gameEngineService.submitEventByType('travel', {
            direction: value,
        });
    }

    collect(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (this.loot.quantity > 0) {
            this.clickEffectService.spawnCollectEffect(event, 1);
            this.loot.quantity = this.loot.quantity - 1;
            this.lootManagerService.addWheat(1);
        }
    }

    onClick(event: MouseEvent) {
        this.clickEffectService.spawnClickEffect(event);
    }

    getRandomPositionStyle(viewportW: number, viewportH: number, pad = 16) {
        const BOX_W = 120;
        const BOX_H = 120;

        const maxLeft = Math.max(0, viewportW - BOX_W - pad * 2);
        const maxTop = Math.max(0, viewportH - BOX_H - pad * 2);

        const left = pad + Math.random() * maxLeft;
        const top = pad + Math.random() * maxTop;

        const leftCss = `${left.toFixed(0)}px`;

        const topCss = `${top.toFixed(0)}px`;

        return { left: leftCss, top: topCss };
    }

    activateSuccesForArrow(value: string) {
        if (value === 'left') {
            this.showLeftSucces.set(true);
            setTimeout(() => this.showLeftSucces.set(false), 200);
        }
        if (value === 'right') {
            this.showRightSucces.set(true);
            setTimeout(() => this.showRightSucces.set(false), 200);
        }
        if (value === 'top') {
            this.showTopSucces.set(true);
            setTimeout(() => this.showTopSucces.set(false), 200);
        }
    }

    private getArrowPath(direction: string, map: string) {
        let content = '';
        if (map === 'tresor') content = '_chest';
        if (map === 'monster') content = '_monster';
        return `assets/arrow/arrow_${direction}${content}.webp`;
    }
}
