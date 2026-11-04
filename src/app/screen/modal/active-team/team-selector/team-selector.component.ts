import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MonsterName } from 'src/app/core/models/monster';

export type ActiveSlot = {
  tamedId: string;
  name: MonsterName;
  portraitSrc: string;
  typeIconSrc: string;
} | null;

@Component({
  selector: 'app-team-selector',
  standalone: true,
  templateUrl: './team-selector.component.html',
  styleUrl: './team-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamSelectorComponent {
  readonly slots = input.required<readonly ActiveSlot[]>();
  readonly selectedIndex = input.required<number>();
  readonly slotSelected = output<number>();
}
