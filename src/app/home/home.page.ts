import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { IonContent, ModalController } from '@ionic/angular/standalone';
import { Application, Container } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { getRendererPreference } from 'src/app/core/helpers/canvas-helper';
import { MapStore } from 'src/app/core/service/map/map.store';
import { MapRenderer } from './pixi-components/map-renderer';
import { MinimapRenderer } from './pixi-components/mini-map-renderer';
import { MoveControllerComponent } from './move-controller/move-controller.component';
import { TopHudBarComponent } from './top-hud-bar/top-hud-bar.component';
import { BottomHudBarComponent } from './bottom-hud-bar/bottom-hud-bar.component';
import { ResourceCollectionService } from '../core/service/resource-collection-service';
import { CombatControllerComponent } from './combat-controller/combat-controller.component';
import { MonsterBarComponent } from './monster-bar/monster-bar.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';
import { CombatStore } from '../core/service/combat/combat.store';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonContent,
    MoveControllerComponent,
    TopHudBarComponent,
    BottomHudBarComponent,
    CombatControllerComponent,
    MonsterBarComponent,
    PlayerBarComponent,
  ],
})
export class HomePage implements AfterViewInit {
  @ViewChild('pixiGameContainer', { static: true })
  pixiGameContainer!: ElementRef<HTMLDivElement>;

  private readonly modalCtrl = inject(ModalController);
  private readonly pixiAssetService = inject(PixiAssetService);
  private readonly mapService = inject(MapStore);
  private readonly destroyRef = inject(DestroyRef);
  readonly combatStore = inject(CombatStore);
  private readonly resourceCollectionService = inject(ResourceCollectionService);

  game = new Application();
  isGameReady = false;
  isCombatRunning = this.combatStore.isCombat;

  worldContainer = new Container();
  uiContainer = new Container();

  private mapRenderer?: MapRenderer;
  private minimapRenderer?: MinimapRenderer;

  constructor() {
    effect(() => {
      const tile = this.mapService.activeTile();

      if (!tile || !this.mapRenderer || !this.minimapRenderer) {
        return;
      }

      this.mapRenderer.render(tile);

      if (this.isCombatRunning()) {
        this.minimapRenderer.hide();
      } else {
        this.minimapRenderer.show();
        this.minimapRenderer.render();
      }
    });

    effect(() => {
      if (!this.combatStore.shouldMonsterAttack()) {
        return;
      }

      void this.resolveMonsterTurn();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initGame();
  }

  async openMap(): Promise<void> {
    const { FullMapComponent } =
      await import('../modal/full-map/full-map.component');

    const modal = await this.modalCtrl.create({
      component: FullMapComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();
  }

  leaveCombat(): void {
    this.combatStore.endCombat();
  }

  async attack(): Promise<void> {
    if (!this.mapRenderer || !this.combatStore.canPlayerAttack()) {
      return;
    }
    this.combatStore.startTurnResolution();
    try {
      const damage = 1;
      this.combatStore.hitMonster(damage);
      await this.mapRenderer.playMonsterDamageAnimation(damage);
      if (!this.combatStore.isMonsterAlive()) {
        this.resourceCollectionService.collectActiveTileMonsterResource();
        await this.mapRenderer?.playMonsterDeathAnimation({
          soul: 3,
          glitchedStone: 1,
        });

        this.combatStore.endCombat();
        return;
      }
      this.combatStore.giveTurnToMonster();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  private async resolveMonsterTurn(): Promise<void> {
    if (!this.mapRenderer || !this.combatStore.shouldMonsterAttack()) {
      return;
    }
    this.combatStore.startTurnResolution();
    try {
      await this.wait(350);
      const damage = 1;
      await this.mapRenderer.playMonsterAttackAnimation(damage);
      this.combatStore.hitPlayer(damage);
      if (!this.combatStore.isPlayerAlive()) {
        this.combatStore.endCombat();
        return;
      }
      this.combatStore.giveTurnToPlayer();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }

  private wait(duration: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }

  private async initGame(): Promise<void> {
    try {
      await this.game.init({
        resizeTo: this.pixiGameContainer.nativeElement,
        resolution: 1,
        autoDensity: true,
        preference: getRendererPreference(),
        preferWebGLVersion: 1,
        antialias: false,
        backgroundAlpha: 0,
      });

      await this.pixiAssetService.loadWorldCore();

      this.pixiGameContainer.nativeElement.appendChild(this.game.canvas);

      this.initContainers();
      this.initRenderers();

      this.isGameReady = true;

      this.destroyRef.onDestroy(() => {
        this.mapRenderer?.destroy();
        this.minimapRenderer?.destroy();
        this.game.destroy(true);
      });
    } catch (error) {
      console.error('Failed to initialize game', error);
    }
  }

  private initContainers(): void {
    this.worldContainer.label = 'worldContainer';
    this.uiContainer.label = 'uiContainer';

    this.worldContainer.zIndex = 0;
    this.uiContainer.zIndex = 1000;

    this.game.stage.sortableChildren = true;
    this.game.stage.addChild(this.worldContainer);
    this.game.stage.addChild(this.uiContainer);
  }

  private initRenderers(): void {
    this.mapRenderer = new MapRenderer(
      this.game,
      this.worldContainer,
      this.pixiAssetService,
      () => this.resourceCollectionService.collectActiveTileResource(),
      () => {
        this.enterCombat();
      },
      (dropType) => {
        switch (dropType) {
          case 'soul':
            this.resourceCollectionService.collectSoul();
            break;
          case 'glitchedStone':
            this.resourceCollectionService.collectGlitchedStone();
            break;
        }
        console.log('Collected drop:', dropType);
      },
    );

    this.minimapRenderer = new MinimapRenderer(
      this.game,
      this.uiContainer,
      this.mapService,
      () => this.openMap(),
    );

    this.mapRenderer.init();
    this.minimapRenderer.init();

    const tile = this.mapService.activeTile();
    if (tile) {
      this.mapRenderer.render(tile);
      this.minimapRenderer.render();
    }
  }

  private async enterCombat(): Promise<void> {
    if (!this.mapRenderer || this.combatStore.isCombat()) {
      return;
    }

    this.combatStore.startCombat();
    this.combatStore.startTurnResolution();

    try {
      await this.mapRenderer.playCombatIntroAnimation();
    } finally {
      this.combatStore.endTurnResolution();
    }
  }
}
