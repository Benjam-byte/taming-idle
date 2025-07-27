import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-world-map',
  imports: [IonContent, CommonModule],
  templateUrl: './world-map.component.html',
  styleUrl: './world-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorldMapComponent {
  gameEngineService = inject(GameEngineService);
  modalCtrl = inject(ModalController);

  onZoneClick(zone: string) {
    console.log('Zone cliquée :', zone);
    if (zone === this.gameEngineService.world().map) this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
