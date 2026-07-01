import { Application, Container, Graphics, Text } from 'pixi.js';
import { MapStore } from 'src/app/core/service/map/map.store';
import { MinimapContentRenderer } from './minimap-content-renderer';
import { MinimapFogRenderer } from './minimap-fog-renderer';
import { MinimapFrameRenderer } from './minimap-frame-renderer';
import { MinimapLayout } from './minimap-layout';
import { MinimapOpenMapButtonRenderer } from './minimap-open-map-button-renderer';
import { MinimapPlayerRenderer } from './minimap-player-renderer';
import { MinimapPositionRenderer } from './minimap-position-renderer';
import { minimapConfig } from './minimap-renderer.types';
import { MinimapTileIconsRenderer } from './minimap-tile-icons-renderer';
import { MinimapTileSource } from './minimap-tile-source';
import { MinimapTileStateResolver } from './minimap-tile-state-resolver';

export class MinimapRenderer {
  private readonly sceneContainer = new Container();
  private readonly shadow = new Graphics();
  private readonly background = new Graphics();
  private readonly innerBackground = new Graphics();

  private readonly viewportContainer = new Container();
  private readonly contentContainer = new Container();
  private readonly maskGraphics = new Graphics();

  private readonly openMapButton = new Graphics();

  private readonly fogContainer = new Container();
  private readonly fogGraphics = new Graphics();

  private readonly playerGraphics = new Graphics();

  private readonly positionText = new Text({
    text: 'x:0 y:0',
    style: {
      fontFamily: 'monospace',
      fontSize: 11,
      fontWeight: '700',
      fill: 0xfff3d0,
      stroke: {
        color: 0x140c07,
        width: 3,
      },
    },
  });

  private readonly layout: MinimapLayout;
  private readonly frameRenderer: MinimapFrameRenderer;
  private readonly contentRenderer: MinimapContentRenderer;
  private readonly fogRenderer: MinimapFogRenderer;
  private readonly playerRenderer: MinimapPlayerRenderer;
  private readonly positionRenderer: MinimapPositionRenderer;
  private readonly openMapButtonRenderer: MinimapOpenMapButtonRenderer;

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly mapService: MapStore,
    onOpenFullMap: () => void,
  ) {
    const tileSource = new MinimapTileSource(
      this.mapService,
      minimapConfig,
    );
    const tileStateResolver = new MinimapTileStateResolver(this.mapService);
    const tileIconsRenderer = new MinimapTileIconsRenderer(minimapConfig);

    this.layout = new MinimapLayout(this.game, minimapConfig);
    this.frameRenderer = new MinimapFrameRenderer(
      this.shadow,
      this.background,
      this.innerBackground,
      this.maskGraphics,
      this.layout,
      minimapConfig,
    );
    this.contentRenderer = new MinimapContentRenderer(
      this.contentContainer,
      tileSource,
      tileStateResolver,
      tileIconsRenderer,
      minimapConfig,
    );
    this.fogRenderer = new MinimapFogRenderer(
      this.fogGraphics,
      tileSource,
      tileStateResolver,
      minimapConfig,
    );
    this.playerRenderer = new MinimapPlayerRenderer(
      this.playerGraphics,
      this.layout,
    );
    this.positionRenderer = new MinimapPositionRenderer(
      this.positionText,
      this.mapService,
    );
    this.openMapButtonRenderer = new MinimapOpenMapButtonRenderer(
      this.openMapButton,
      this.layout,
      minimapConfig,
      onOpenFullMap,
    );
  }

  init(): void {
    this.sceneContainer.label = 'minimapSceneContainer';
    this.viewportContainer.label = 'minimapViewportContainer';
    this.contentContainer.label = 'minimapContentContainer';
    this.fogContainer.label = 'minimapFogContainer';
    this.fogGraphics.label = 'minimapFogGraphics';

    this.fogContainer.addChild(this.fogGraphics);

    this.viewportContainer.addChild(this.contentContainer);
    this.viewportContainer.addChild(this.fogContainer);
    this.viewportContainer.addChild(this.maskGraphics);
    this.viewportContainer.mask = this.maskGraphics;

    this.sceneContainer.addChild(this.shadow);
    this.sceneContainer.addChild(this.background);
    this.sceneContainer.addChild(this.innerBackground);
    this.sceneContainer.addChild(this.viewportContainer);
    this.sceneContainer.addChild(this.playerGraphics);
    this.sceneContainer.addChild(this.positionText);
    this.sceneContainer.addChild(this.openMapButton);

    this.container.addChild(this.sceneContainer);

    this.openMapButtonRenderer.init();
    this.render();
  }

  render(): void {
    this.layout.layoutScene(
      this.sceneContainer,
      this.viewportContainer,
      this.playerGraphics,
      this.positionText,
    );
    this.frameRenderer.render();
    this.contentRenderer.render();
    this.layout.positionContent(
      this.contentContainer,
      this.fogContainer,
      this.mapService.playerCoordinate(),
    );
    this.fogRenderer.render();
    this.playerRenderer.render();
    this.positionRenderer.render();
    this.openMapButtonRenderer.render();
  }

  destroy(): void {
    this.openMapButtonRenderer.destroy();

    if (this.sceneContainer.parent) {
      this.sceneContainer.parent.removeChild(this.sceneContainer);
    }

    this.sceneContainer.destroy({ children: true });
  }

  hide(): void {
    this.sceneContainer.visible = false;
  }

  show(): void {
    this.sceneContainer.visible = true;
  }

  isVisible(): boolean {
    return this.sceneContainer.visible;
  }
}
