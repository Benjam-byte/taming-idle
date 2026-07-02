import { Component, Input, input, output } from '@angular/core';

@Component({
  selector: 'app-combat-controller',
  templateUrl: './combat-controller.component.html',
  styleUrls: ['./combat-controller.component.scss'],
})
export class CombatControllerComponent {
  specialCharge = input<number>(0);
  attack = output();
  disabled = input(true);

  onAttack(): void {
    this.attack.emit();
  }
}
