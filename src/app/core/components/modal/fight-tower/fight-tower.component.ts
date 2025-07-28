import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AttackButtonComponent } from './attack-button/attack-button.component';
import { HealthBarComponent } from '../../health-bar/health-bar.component';
import { WorldMapComponent } from '../world-map/world-map.component';
import { MonsterSpriteComponent } from '../../monster-sprite/monster-sprite.component';

@Component({
  selector: 'app-fight-tower',
  imports: [
    IonContent,
    CommonModule,
    AttackButtonComponent,
    HealthBarComponent,
    MonsterSpriteComponent,
  ],
  templateUrl: './fight-tower.component.html',
  styleUrl: './fight-tower.component.scss',
})
export class FightTowerComponent {
  gameEngineService = inject(GameEngineService);
  modalCtrl = inject(ModalController);
  cdr = inject(ChangeDetectorRef);
  borderHeight = 100;
  isFighting = false;
  isBossKilled = false;
  timer!: ReturnType<typeof setInterval>;
  combatTower = this.gameEngineService.combatTower();
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

  close() {
    this.modalCtrl.dismiss();
  }

  continue() {
    this.isFighting = false;
    this.isBossKilled = false;
    this.borderHeight = 100;
  }

  hit() {
    this.gameEngineService.submitEventByType('fight', () => {
      if (!this.combatTower.boss.isAlive) return;
      this.combatTower.boss.getHit(this.gameEngineService.human().damage);
      this.bossKilled();
    });
  }

  private bossKilled() {
    if (this.combatTower.boss.isAlive) return;
    this.gameEngineService.combatTower().levelUp();
    this.borderHeight = 0;
    this.isBossKilled = true;
    if (this.timer) clearInterval(this.timer);
  }

  startFight() {
    if (this.isFighting) return;
    this.isFighting = true;

    const duration = 10000;
    const interval = 100;
    const start = Date.now();

    this.timer = setInterval(() => {
      const elapsed = Date.now() - start;
      this.borderHeight = Math.max(100 - (elapsed / duration) * 100, 0);

      if (elapsed >= duration) {
        this.borderHeight = 0;
        clearInterval(this.timer);
        this.isFighting = false;
      }
    }, interval);
  }

  openWorldMapModal() {
    this.close();
    this.openWorldModal();
  }

  async openWorldModal() {
    const modal = await this.modalCtrl.create({
      component: WorldMapComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    modal.present();
  }
}
