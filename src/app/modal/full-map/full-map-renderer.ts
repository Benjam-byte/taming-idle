import {
  Application,
  Container,
  FederatedPointerEvent,
  Graphics,
} from 'pixi.js';
import { MapService } from 'src/app/core/service/map/map-service';
import { Tile } from 'src/app/core/service/map/tile';

export class FullMapRenderer {
  private readonly sceneContainer = new Container();
  private readonly mapContainer = new Container();

  private readonly tileGraphics = new Graphics();
  private readonly fogGraphics = new Graphics();
  private readonly markerGraphics = new Graphics();
  private readonly playerGraphics = new Graphics();

  private readonly cellSize = 34;
  private readonly minScale = 0.5;
  private readonly maxScale = 2.2;

  private isDragging = false;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private lastPointerX = 0;
  private lastPointerY = 0;

  private readonly colors = {
    tile: 0x4f7f35,
    tileAlt: 0x426f2c,
    tileLine: 0x2f4f20,

    unknownFog: 0x050403,
    seenFog: 0x1b130d,

    resource: 0xd5a13a,
    monster: 0x9f3f2f,

    marker: 0xfff3d0,
    markerBorder: 0x140c07,

    player: 0x6ee08f,
    playerBorder: 0xfff3d0,
  };

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly mapService: MapService,
  ) {}

  init(): void {
    this.sceneContainer.label = 'fullMapSceneContainer';
    this.mapContainer.label = 'fullMapContentContainer';

    this.mapContainer.addChild(this.tileGraphics);
    this.mapContainer.addChild(this.fogGraphics);
    this.mapContainer.addChild(this.markerGraphics);
    this.mapContainer.addChild(this.playerGraphics);

    this.sceneContainer.addChild(this.mapContainer);
    this.container.addChild(this.sceneContainer);

    this.bindInteractions();
    this.render();
    this.centerOnPlayer();
  }

  render(): void {
    this.drawTiles();
    this.drawFog();
    this.drawMarkers();
    this.drawPlayer();
  }

  destroy(): void {
    this.sceneContainer.removeAllListeners();
    this.game.canvas.removeEventListener('wheel', this.handleWheel);

    if (this.sceneContainer.parent) {
      this.sceneContainer.parent.removeChild(this.sceneContainer);
    }

    this.sceneContainer.destroy({ children: true });
  }

  private bindInteractions(): void {
    this.sceneContainer.eventMode = 'static';
    this.sceneContainer.hitArea = this.game.screen;

    this.sceneContainer.on('pointerdown', (event) => {
      this.isDragging = true;

      this.pointerDownX = event.global.x;
      this.pointerDownY = event.global.y;

      this.lastPointerX = event.global.x;
      this.lastPointerY = event.global.y;
    });

    this.sceneContainer.on('pointermove', (event) => {
      if (!this.isDragging) {
        return;
      }

      const dx = event.global.x - this.lastPointerX;
      const dy = event.global.y - this.lastPointerY;

      this.mapContainer.x += dx;
      this.mapContainer.y += dy;

      this.lastPointerX = event.global.x;
      this.lastPointerY = event.global.y;
    });

    this.sceneContainer.on('pointerup', (event) => {
      this.handlePointerUp(event);
    });

    this.sceneContainer.on('pointerupoutside', () => {
      this.isDragging = false;
    });

    this.game.canvas.addEventListener('wheel', this.handleWheel, {
      passive: false,
    });
  }

  private handlePointerUp(event: FederatedPointerEvent): void {
    const moved =
      Math.abs(event.global.x - this.pointerDownX) > 4 ||
      Math.abs(event.global.y - this.pointerDownY) > 4;

    this.isDragging = false;

    if (moved) {
      return;
    }

    const coordinate = this.screenToTile(event.global.x, event.global.y);

    if (!this.mapService.isTileSeen(coordinate.x, coordinate.y)) {
      return;
    }

    this.mapService.addMarker(coordinate, 'custom');
    this.render();
  }

  private readonly handleWheel = (event: WheelEvent): void => {
    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const currentScale = this.mapContainer.scale.x;

    const nextScale = Math.max(
      this.minScale,
      Math.min(this.maxScale, currentScale * zoomFactor),
    );

    const rect = this.game.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const worldBefore = this.mapContainer.toLocal({ x: mouseX, y: mouseY });

    this.mapContainer.scale.set(nextScale);

    const worldAfter = this.mapContainer.toGlobal(worldBefore);

    this.mapContainer.x += mouseX - worldAfter.x;
    this.mapContainer.y += mouseY - worldAfter.y;
  };

  centerOnPlayer(): void {
    console.log(
      'full map screen',
      this.game.screen.width,
      this.game.screen.height,
    );
    console.log('player', this.mapService.playerCoordinate());
    console.log('map position', this.mapContainer.x, this.mapContainer.y);
    const player = this.mapService.playerCoordinate();

    const screenWidth = this.game.screen.width;
    const screenHeight = this.game.screen.height;

    const playerWorldX = player.x * this.cellSize + this.cellSize / 2;
    const playerWorldY = player.y * this.cellSize + this.cellSize / 2;

    this.mapContainer.pivot.set(0, 0);
    this.mapContainer.scale.set(1);

    this.mapContainer.position.set(
      screenWidth / 2 - playerWorldX,
      screenHeight / 2 - playerWorldY,
    );
  }

  private drawTiles(): void {
    this.tileGraphics.clear();

    const chunkMap = this.mapService.exploredChunkList();

    for (const chunk of chunkMap.values()) {
      for (const tile of chunk.tileList) {
        this.drawTile(tile);
      }
    }
  }

  private drawTile(tile: Tile): void {
    const { x, y } = tile.coordinate;

    const isVisibleNow = this.isVisibleNow(x, y);
    const isVisited = this.mapService.isTileVisited(x, y);
    const isSeen = this.mapService.isTileSeen(x, y);

    const isKnown = isVisibleNow || isVisited || isSeen;

    if (!isKnown) {
      return;
    }

    const px = x * this.cellSize;
    const py = y * this.cellSize;

    const isAlt = Math.abs(x + y) % 2 === 0;
    const color = isAlt ? this.colors.tile : this.colors.tileAlt;

    this.tileGraphics.rect(px, py, this.cellSize, this.cellSize).fill({
      color,
      alpha: isSeen && !isVisited && !isVisibleNow ? 0.55 : 1,
    });

    this.tileGraphics
      .rect(px, py, this.cellSize, this.cellSize)
      .stroke({ color: this.colors.tileLine, alpha: 0.25, width: 1 });

    if (tile.hasResource && isSeen) {
      this.drawResourceIcon(tile, isVisibleNow || isVisited ? 1 : 0.55);
    }

    const shouldShowMonster =
      tile.hasMonster && (isVisited || this.mapService.isMonsterSpotted(x, y));

    if (shouldShowMonster) {
      this.drawMonsterIcon(tile, isVisibleNow || isVisited ? 1 : 0.65);
    }
  }

  private drawResourceIcon(tile: Tile, alpha: number): void {
    const cx = tile.coordinate.x * this.cellSize + this.cellSize / 2;
    const cy = tile.coordinate.y * this.cellSize + this.cellSize / 2;

    this.tileGraphics
      .circle(cx, cy, 5)
      .fill({ color: this.colors.resource, alpha })
      .stroke({ color: 0x140c07, width: 1 });
  }

  private drawMonsterIcon(tile: Tile, alpha: number): void {
    const cx = tile.coordinate.x * this.cellSize + this.cellSize / 2;
    const cy = tile.coordinate.y * this.cellSize + this.cellSize / 2;

    this.tileGraphics
      .circle(cx, cy, 6)
      .fill({ color: this.colors.monster, alpha })
      .stroke({ color: 0x140c07, width: 1 });
  }

  private drawFog(): void {
    this.fogGraphics.clear();

    const chunkMap = this.mapService.exploredChunkList();

    for (const chunk of chunkMap.values()) {
      for (const tile of chunk.tileList) {
        const { x, y } = tile.coordinate;

        const isVisibleNow = this.isVisibleNow(x, y);
        const isVisited = this.mapService.isTileVisited(x, y);
        const isSeen = this.mapService.isTileSeen(x, y);

        if (isVisibleNow || isVisited) {
          continue;
        }

        const px = x * this.cellSize;
        const py = y * this.cellSize;

        this.fogGraphics.rect(px, py, this.cellSize, this.cellSize).fill({
          color: isSeen ? this.colors.seenFog : this.colors.unknownFog,
          alpha: isSeen ? 0.42 : 0.98,
        });
      }
    }
  }

  private drawMarkers(): void {
    this.markerGraphics.clear();

    for (const marker of this.mapService.markers()) {
      const { x, y } = marker.coordinate;

      if (!this.mapService.isTileSeen(x, y)) {
        continue;
      }

      const cx = x * this.cellSize + this.cellSize / 2;
      const cy = y * this.cellSize + this.cellSize / 2;

      this.markerGraphics
        .circle(cx, cy, 8)
        .fill({ color: this.colors.marker })
        .stroke({ color: this.colors.markerBorder, width: 2 });

      this.markerGraphics
        .circle(cx, cy, 3)
        .fill({ color: this.colors.monster });
    }
  }

  private drawPlayer(): void {
    this.playerGraphics.clear();

    const player = this.mapService.playerCoordinate();

    const cx = player.x * this.cellSize + this.cellSize / 2;
    const cy = player.y * this.cellSize + this.cellSize / 2;

    this.playerGraphics
      .circle(cx + 2, cy + 3, 9)
      .fill({ color: 0x140c07, alpha: 0.55 });

    this.playerGraphics
      .circle(cx, cy, 9)
      .fill({ color: this.colors.player })
      .stroke({ color: this.colors.playerBorder, width: 2 });
  }

  private isVisibleNow(tileX: number, tileY: number): boolean {
    const player = this.mapService.playerCoordinate();

    return this.mapService.isInVisionRange(tileX, tileY, player.x, player.y);
  }

  private screenToTile(
    screenX: number,
    screenY: number,
  ): {
    x: number;
    y: number;
  } {
    const local = this.mapContainer.toLocal({ x: screenX, y: screenY });

    return {
      x: Math.floor(local.x / this.cellSize),
      y: Math.floor(local.y / this.cellSize),
    };
  }
}
