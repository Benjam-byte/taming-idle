import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hud-resource-chip',
  standalone: true,
  templateUrl: './hud-resource-chip.component.html',
  styleUrl: './hud-resource-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HudResourceChipComponent {
  readonly iconSrc = input.required<string>();
  readonly alt = input('');
  readonly value = input<number | string>(0);
  readonly largeIcon = input(false);
}
