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
import { MapService } from 'src/app/core/service/map/map-service';
import { MapRenderer } from './pixi-components/map-renderer';
import { MinimapRenderer } from './pixi-components/mini-map-renderer';
import { MoveControllerComponent } from './move-controller/move-controller.component';
import { TopHudBarComponent } from './top-hud-bar/top-hud-bar.component';
import { BottomHudBarComponent } from './bottom-hud-bar/bottom-hud-bar.component';
import { ResourceCollectionService } from '../core/service/resource-collection-service';
import { CombatService } from '../core/service/combat-service';
import { CombatControllerComponent } from './combat-controller/combat-controller.component';
import { MonsterBarComponent } from './monster-bar/monster-bar.component';
import { PlayerBarComponent } from './player-bar/player-bar.component';

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
  private readonly mapService = inject(MapService);
  private readonly combatService = inject(CombatService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resourceCollectionService = inject(
    ResourceCollectionService,
  );

  game = new Application();
  isGameReady = false;
  isCombatRunning = this.combatService.isCombat;

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
        this.minimapRenderer?.hide();
      } else {
        this.minimapRenderer?.show();
        this.minimapRenderer?.render();
      }
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

  leaveCombat() {
    this.combatService.endCombat();
  }

  private async initGame(): Promise<void> {
    try {
      await this.game.init({
        background: '#1099bb',
        resizeTo: this.pixiGameContainer.nativeElement,
        preference: getRendererPreference(),
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
      () => this.combatService.startCombat(),
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
}
