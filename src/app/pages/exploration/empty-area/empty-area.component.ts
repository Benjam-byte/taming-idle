import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { ClickEffectService } from 'src/app/core/service/Ui/clickEffect.service';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { LootManagerService } from 'src/app/core/service/player/loot-manager.service';
import { BroadcastService } from 'src/app/core/service/Ui/broadcast.service';

@Component({
  selector: 'app-empty-area',
  templateUrl: './empty-area.component.html',
  styleUrls: ['./empty-area.component.scss'],
  imports: [],
})
export class EmptyAreaComponent implements OnInit {
  gameEngineService = inject(GameEngineService);
  lootManagerService = inject(LootManagerService);
  clickEffectService = inject(ClickEffectService);
  broadcastMessageService = inject(BroadcastService);

  host = inject(ElementRef<HTMLElement>);
  position!: { top: string; left: string };
  lootQuantity: number;

  constructor() {
    this.lootQuantity = this.lootManagerService.getLootValue();
  }

  ngOnInit(): void {
    this.position = this.getRandomPositionStyle(
      this.host.nativeElement.getBoundingClientRect().width,
      this.host.nativeElement.getBoundingClientRect().height
    );
  }

  collect(event: MouseEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (this.lootQuantity > 0) {
      this.clickEffectService.spawnCollectEffect(event, 1);
      this.lootQuantity = this.lootQuantity - 1;
      this.lootManagerService.addWheat(1);
    }
  }

  onClick(event: MouseEvent) {
    this.clickEffectService.spawnClickEffect(event);
    this.gameEngineService.submitEventByType('travel');
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
}
