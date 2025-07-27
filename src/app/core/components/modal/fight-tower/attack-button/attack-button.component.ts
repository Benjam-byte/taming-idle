import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attack-button',
  imports: [],
  templateUrl: './attack-button.component.html',
  styleUrl: './attack-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttackButtonComponent {}
