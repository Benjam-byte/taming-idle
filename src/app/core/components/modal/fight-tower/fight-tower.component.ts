import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AttackButtonComponent } from './attack-button/attack-button.component';

@Component({
  selector: 'app-fight-tower',
  imports: [IonContent, CommonModule, AttackButtonComponent],
  templateUrl: './fight-tower.component.html',
  styleUrl: './fight-tower.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FightTowerComponent {
  gameEngineService = inject(GameEngineService);
  modalCtrl = inject(ModalController);

  close() {
    this.modalCtrl.dismiss();
  }
}
