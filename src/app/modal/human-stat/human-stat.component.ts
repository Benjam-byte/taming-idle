import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import {
  IonContent,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-human-stat',
  imports: [IonContent, IonButton],
  templateUrl: './human-stat.component.html',
  styleUrl: './human-stat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HumanStatComponent {
  gameEngineService = inject(GameEngineService);
  modalCtrl = inject(ModalController);
  human = this.gameEngineService.human();

  close() {
    this.modalCtrl.dismiss();
  }
}
