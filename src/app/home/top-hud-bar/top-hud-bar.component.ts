import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class TopHudBarComponent {}
