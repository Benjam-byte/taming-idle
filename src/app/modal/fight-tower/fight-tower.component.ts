import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { GameEngineService } from 'src/app/core/service/game-engine.service';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AttackButtonComponent } from './attack-button/attack-button.component';
import { WorldMapComponent } from '../world-map/world-map.component';
import { HealthBarComponent } from '../../../app/core/components/health-bar/health-bar.component';
import { MonsterSpriteComponent } from '../../../app/core/components/monster-sprite/monster-sprite.component';
import { CombatTowerManagerService } from 'src/app/core/service/location/combat-tower.service';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';
import TowerMonster from 'src/app/core/value-object/tower-monster';

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
  humanManagerService = inject(HumanManagerService);
  combatTowerService = inject(CombatTowerManagerService);
  modalCtrl = inject(ModalController);
  cdr = inject(ChangeDetectorRef);
  borderHeight = 100;
  boss!: TowerMonster;
  isFighting = false;
  isBossKilled = false;
  isBossFailed = false;
  timer!: ReturnType<typeof setInterval>;
  fightingCountDown$ = this.gameEngineService.getFightingCountDown$();

  constructor() {
    this.boss = this.combatTowerService.getBoss();
  }

  close() {
    this.modalCtrl.dismiss();
  }

  continue() {
    this.isFighting = false;
    this.isBossKilled = false;
    this.borderHeight = 100;
    this.boss = this.combatTowerService.getBoss();
  }

  retry() {
    this.isFighting = false;
    this.isBossFailed = false;
    this.borderHeight = 100;
    this.boss = this.combatTowerService.getBoss();
  }

  hit(boss: TowerMonster) {
    this.gameEngineService.submitEventByType('fight', () => {
      if (!boss.isAlive) return;
      boss.getHit(this.humanManagerService.damage);
      this.bossKilled(boss);
    });
  }

  private bossKilled(boss: TowerMonster) {
    if (boss.isAlive) return;
    this.combatTowerService.levelUp();
    this.borderHeight = 0;
    this.isBossKilled = true;
    if (this.timer) clearInterval(this.timer);
  }

  private bossFightFailed() {
    this.isBossFailed = true;
    this.borderHeight = 0;
    clearInterval(this.timer);
    this.isFighting = false;
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
        this.bossFightFailed();
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
