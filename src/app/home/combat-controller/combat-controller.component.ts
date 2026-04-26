import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-combat-controller',
  templateUrl: './combat-controller.component.html',
  styleUrls: ['./combat-controller.component.scss'],
})
export class CombatControllerComponent {
  specialCharge = 0;

  onAttack(): void {
    if (this.specialCharge >= 100) {
      this.useSpecialAttack();
      this.specialCharge = 0;
      return;
    }

    this.useBasicAttack();
    this.specialCharge = Math.min(this.specialCharge + 25, 100);
  }

  private useBasicAttack(): void {
    console.log('basic attack');
  }

  private useSpecialAttack(): void {
    console.log('special attack');
  }
}
