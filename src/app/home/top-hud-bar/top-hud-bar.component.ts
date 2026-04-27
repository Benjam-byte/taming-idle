import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LootStore } from 'src/app/database/store/loot.store';

export type HudResource = {
  id: string;
  value: number;
  iconSrc: string;
  alt?: string;
};

@Component({
  selector: 'app-top-hud-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-hud-bar.component.html',
})
export class TopHudBarComponent {
  private readonly lootStore = inject(LootStore);

  wheat = this.lootStore.wheat;
  soul = this.lootStore.soul;
  glitchedStone = this.lootStore.glitchedStone;
}
