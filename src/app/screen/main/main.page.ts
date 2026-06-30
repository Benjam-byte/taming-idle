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
import { MapSceneRenderer } from '../pixi-components/main/map-scene-renderer';
import { MinimapRenderer } from '../pixi-components/main/minimap/minimap-renderer';
import { ResourceCollectionService } from '../../core/service/resource-collection-service';
import { CombatService } from '../../core/service/combat/combat-service';
import { TopHudBarComponent } from './hud/top-hud-bar/top-hud-bar.component';
import { BottomHudBarComponent } from './hud/bottom-hud-bar/bottom-hud-bar.component';
import { ExplorationComponent } from './exploration/exploration.component';
import { CombatComponent } from './combat/combat.component';

@Component({
  selector: 'app-main',
  templateUrl: 'main.page.html',
  styleUrls: ['main.page.scss'],
  imports: [
    IonContent,
    TopHudBarComponent,
    BottomHudBarComponent,
    ExplorationComponent,
    CombatComponent,
  ],
})
export class MainPage implements AfterViewInit {
  @ViewChild('pixiGameContainer', { static: true })
  pixiGameContainer!: ElementRef<HTMLDivElement>;

  private readonly modalCtrl = inject(ModalController);
  private readonly pixiAssetService = inject(PixiAssetService);
  private readonly mapService = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly combatService = inject(CombatService);
  private readonly resourceCollectionService = inject(
    ResourceCollectionService,
  );

  game = new Application();
  isGameReady = false;
  isCombatRunning = this.combatService.isCombat;

  worldContainer = new Container();
  uiContainer = new Container();

  mapSceneRenderer?: MapSceneRenderer;
  private minimapRenderer?: MinimapRenderer;

  constructor() {
    effect(() => {
      const tile = this.mapService.activeTile();

      if (!tile || !this.mapSceneRenderer || !this.minimapRenderer) {
        return;
      }

      this.mapSceneRenderer.render(tile);

      if (this.isCombatRunning()) {
        this.minimapRenderer.hide();
      } else {
        this.minimapRenderer.show();
        this.minimapRenderer.render();
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
        this.mapSceneRenderer?.destroy();
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
    this.mapSceneRenderer = new MapSceneRenderer(
      this.game,
      this.worldContainer,
      this.pixiAssetService,
      () => this.resourceCollectionService.collectActiveTileResource(),
      () => this.showCombat(),
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

    this.mapSceneRenderer.init();
    this.minimapRenderer.init();

    const tile = this.mapService.activeTile();
    if (tile) {
      this.mapSceneRenderer.render(tile);
      this.minimapRenderer.render();
    }
  }

  private showCombat(): void {
    if (this.combatService.isCombat()) {
      return;
    }

    this.combatService.startCombat();
  }
}
