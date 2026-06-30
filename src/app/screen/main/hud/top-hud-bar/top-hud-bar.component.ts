import { Component, inject } from '@angular/core';
import { LootStore } from 'src/app/database/store/loot.store';
import { HudResourceChipComponent } from 'src/app/screen/main/hud/hud-resource-chip/hud-resource-chip.component';

@Component({
  selector: 'app-top-hud-bar',
  standalone: true,
  imports: [HudResourceChipComponent],
  templateUrl: './top-hud-bar.component.html',
})
export class TopHudBarComponent {
  private readonly lootStore = inject(LootStore);

  wheat = this.lootStore.wheat;
  soul = this.lootStore.soul;
  glitchedStone = this.lootStore.glitchedStone;
}
