import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectGlitchedStone, selectSoul, selectWheat } from 'src/app/store/loot/loot.reducer';
import { HudResourceChipComponent } from 'src/app/ui/hud-resource-chip/hud-resource-chip.component';

@Component({
  selector: 'app-top-hud-bar',
  standalone: true,
  imports: [HudResourceChipComponent],
  templateUrl: './top-hud-bar.component.html',
})
export class TopHudBarComponent {
  private readonly store = inject(Store);

  wheat = this.store.selectSignal(selectWheat);
  soul = this.store.selectSignal(selectSoul);
  glitchedStone = this.store.selectSignal(selectGlitchedStone);
}
