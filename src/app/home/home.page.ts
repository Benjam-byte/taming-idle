import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  effect,
  inject,
} from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Application, Container } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { getRendererPreference } from 'src/app/core/helpers/canvas-helper';
import { MapService } from 'src/app/core/service/map/map-service';
import { MapRenderer } from './pixi-components/map-renderer';
import { MinimapRenderer } from './pixi-components/mini-map-renderer';
import { MoveControllerComponent } from './move-controller/move-controller.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, MoveControllerComponent],
})
export class HomePage implements AfterViewInit {
  @ViewChild('pixiGameContainer', { static: true })
  pixiGameContainer!: ElementRef<HTMLDivElement>;

  private readonly pixiAssetService = inject(PixiAssetService);
  private readonly mapService = inject(MapService);
  private readonly destroyRef = inject(DestroyRef);

  game = new Application();
  isGameReady = false;

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
      this.minimapRenderer.render();
    });
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initGame();
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
    );

    this.minimapRenderer = new MinimapRenderer(
      this.game,
      this.uiContainer,
      this.mapService,
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
