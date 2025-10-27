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
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MapManagerService } from 'src/app/core/service/location/map.service';
import { AssignedMonsterManagerService } from 'src/app/core/service/player/assigned-monster-manager.service';
import { AutoPilotService } from 'src/app/core/service/auto-pilot';
import { MonsterSpriteComponent } from 'src/app/core/components/monster-sprite/monster-sprite.component';
import { GatherFacade } from './gather-facade';

@Component({
    selector: 'app-empty-area',
    templateUrl: './empty-area.component.html',
    styleUrls: ['./empty-area.component.scss'],
    imports: [MonsterSpriteComponent],
})
export class EmptyAreaComponent {
    gatherFacade = inject(GatherFacade);
    mapManagerService = inject(MapManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    gameEngineService = inject(GameEngineService);
    clickEffectService = inject(ClickEffectService);
    broadcastMessageService = inject(BroadcastService);
    autoPilotService = inject(AutoPilotService);
    hostRef = inject(ElementRef<HTMLElement>);

    host = this.gatherFacade.host;
    position = this.gatherFacade.lootPosition;
    loot = this.gatherFacade.loot;

    countDown = toSignal(this.gameEngineService.getTravelCountDown$());
    isActive = computed(() => this.countDown() === 0);

    showRightSucces = signal(false);
    showLeftSucces = signal(false);
    showTopSucces = signal(false);

    egg = this.gatherFacade.egg;
    eggPosition = this.gatherFacade.eggPosition;

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
        const map = this.assignedMonsterManager.trackDirection(
            this.mapManagerService.availableMap().right
        );
        return this.getArrowPath('right', map);
    });
    leftArrowImage = computed(() => {
        const map = this.assignedMonsterManager.trackDirection(
            this.mapManagerService.availableMap().left
        );
        return this.getArrowPath('left', map);
    });
    topArrowImage = computed(() => {
        const map = this.assignedMonsterManager.trackDirection(
            this.mapManagerService.availableMap().top
        );
        return this.getArrowPath('top', map);
    });

    constructor() {
        this.gatherFacade.setHost(this.hostRef);
        effect(() => {
            this.mapManagerService.map();
            this.gatherFacade.updateWheat();
            this.gatherFacade.updateEgg();
        });
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
        this.gatherFacade.collectWheat(event);
    }

    collectEgg(event: MouseEvent) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.gatherFacade.collectEgg(event);
    }

    onClick(event: MouseEvent) {
        this.clickEffectService.spawnClickEffect(event);
    }

    getRandomPositionStyle(viewportW: number, viewportH: number, pad = 16) {
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
