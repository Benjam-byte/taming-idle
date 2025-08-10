import { inject, Injectable } from '@angular/core';
import { GameEngineService } from './game-engine.service';
import { MapService } from './location/map.service';

@Injectable({
  providedIn: 'root',
})
export class ClickEffectService {
  gameEngineService = inject(GameEngineService);
  mapService = inject(MapService);
  currentMap = this.mapService.map().content();

  constructor() {}

  spawnClickEffect(event: MouseEvent) {
    this.gameEngineService.getNextTick$().subscribe((now) => {
      if (this.currentMap === 'monster')
        this.spawnDamageClickEffect(
          event,
          this.gameEngineService.human().getClickDamage(now)
        );
      else this.spawnTravelClickEffect(event);
    });
  }

  damageClickEffect(event: MouseEvent) {
    this.gameEngineService.getNextTick$().subscribe((now) => {
      this.spawnDamageClickEffect(
        event,
        this.gameEngineService.human().getClickDamage(now)
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
