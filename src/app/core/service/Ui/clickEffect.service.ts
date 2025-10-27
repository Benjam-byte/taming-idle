import { inject, Injectable } from '@angular/core';
import { GameEngineService } from '../game-engine.service';
import { MapManagerService } from '../location/map.service';
import { AssignedMonsterManagerService } from '../player/assigned-monster-manager.service';

@Injectable({
    providedIn: 'root',
})
export class ClickEffectService {
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    gameEngineService = inject(GameEngineService);
    mapService = inject(MapManagerService);
    currentMap = this.mapService.map();

    constructor() {}

    spawnClickEffect(event: MouseEvent) {
        this.gameEngineService.getNextTick$().subscribe((now) => {
            if (this.currentMap.map === 'monster')
                this.spawnDamageClickEffect(
                    event,
                    this.assignedMonsterManager.getClickDamage(now)
                );
            else this.spawnTravelClickEffect(event);
        });
    }

    damageClickEffect(event: MouseEvent) {
        this.gameEngineService.getNextTick$().subscribe((now) => {
            this.spawnDamageClickEffect(
                event,
                this.assignedMonsterManager.getClickDamage(now)
            );
        });
    }

    spawnCollectEffect(event: MouseEvent, value: number) {
        const pickupText = document.createElement('div');
        pickupText.className = 'pickup-text';
        pickupText.textContent = '+' + value;
        pickupText.style.left = `${event.clientX}px`;
        pickupText.style.top = `${event.clientY}px`;
        document.body.appendChild(pickupText);
        setTimeout(() => {
            pickupText.remove();
        }, 600);
    }

    spawnCollectEffectFromAuto(event: { x: number; y: number }, value: number) {
        const pickupText = document.createElement('div');
        pickupText.className = 'pickup-text';
        pickupText.textContent = '+' + value;
        pickupText.style.left = `${event.x}px`;
        pickupText.style.top = `${event.y}px`;
        document.body.appendChild(pickupText);
        setTimeout(() => {
            pickupText.remove();
        }, 600);
    }

    spawnCollectEggEffect(event: MouseEvent, value: number) {
        const pickupText = document.createElement('div');
        pickupText.className = 'egg-text';
        pickupText.textContent = '+' + value;
        pickupText.style.left = `${event.clientX}px`;
        pickupText.style.top = `${event.clientY}px`;
        document.body.appendChild(pickupText);
        setTimeout(() => {
            pickupText.remove();
        }, 600);
    }

    spawnCollectEggEffectFromAuto(
        event: { x: number; y: number },
        value: number
    ) {
        const pickupText = document.createElement('div');
        pickupText.className = 'egg-text';
        pickupText.textContent = '+' + value;
        pickupText.style.left = `${event.x}px`;
        pickupText.style.top = `${event.y}px`;
        document.body.appendChild(pickupText);
        setTimeout(() => {
            pickupText.remove();
        }, 600);
    }

    spawnTravelClickEffect(event: MouseEvent) {
        const circle = document.createElement('div');
        circle.className = 'click-circle';
        circle.style.left = `${event.clientX}px`;
        circle.style.top = `${event.clientY}px`;

        document.body.appendChild(circle);

        setTimeout(() => {
            circle.remove();
        }, 600);
    }

    spawnFailMessageClickEffect(event: MouseEvent, message: string) {
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = message;

        messageText.style.left = `${event.clientX}px`;
        messageText.style.top = `${event.clientY}px`;

        document.body.appendChild(messageText);

        setTimeout(() => {
            messageText.remove();
        }, 6000);
    }

    spawnDamageClickEffect(event: MouseEvent, damage: number) {
        const damageText = document.createElement('div');
        damageText.className = 'damage-text';
        damageText.textContent = `–${damage}`;

        damageText.style.left = `${event.clientX}px`;
        damageText.style.top = `${event.clientY}px`;

        const container = document.querySelector('.click-effect-layer');
        container?.appendChild(damageText);

        setTimeout(() => {
            damageText.remove();
        }, 600);
    }
}
