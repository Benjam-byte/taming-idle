import { Component, inject } from '@angular/core';
import { LootManagerService } from '../../service/player/loot-manager.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-bar',
  imports: [CommonModule],
  templateUrl: './info-bar.component.html',
  styleUrl: './info-bar.component.scss',
})
export class InfoBarComponent {
  lootManagerService = inject(LootManagerService);
}
