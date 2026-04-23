import { Application, Container, Graphics } from 'pixi.js';
import { MapService } from 'src/app/core/service/map/map';
import { Tile } from 'src/app/core/service/map/Tile';

export class MinimapRenderer {
  private readonly sceneContainer = new Container();
  private readonly background = new Graphics();

  private readonly viewportContainer = new Container();
  private readonly contentContainer = new Container();
  private readonly maskGraphics = new Graphics();

  private readonly fogContainer = new Container();
  private readonly fogGraphics = new Graphics();

  private readonly playerGraphics = new Graphics();

  private readonly visibleTileWidth = 8;
  private readonly visibleTileHeight = 8;

  private readonly loadedChunkRadius = 2;
  private readonly visionRadius = 2;

  private readonly cellSize = 16;
  private readonly padding = 10;
  private readonly margin = 16;
  private readonly borderRadius = 12;
  private readonly backgroundAlpha = 0.72;

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly mapService: MapService,
  ) {}

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

    this.sceneContainer.addChild(this.background);
    this.sceneContainer.addChild(this.viewportContainer);
    this.sceneContainer.addChild(this.playerGraphics);

    this.container.addChild(this.sceneContainer);

    this.layout();
    this.drawFrame();
    this.drawMask();
    this.drawChunks();
    this.positionContent();
    this.drawFog();
    this.drawPlayer();
  }

  render(): void {
    this.layout();
    this.drawFrame();
    this.drawMask();
    this.drawChunks();
    this.positionContent();
    this.drawFog();
    this.drawPlayer();
  }

  destroy(): void {
    if (this.sceneContainer.parent) {
      this.sceneContainer.parent.removeChild(this.sceneContainer);
    }

    this.sceneContainer.destroy({ children: true });
  }

  private layout(): void {
    const visiblePixelWidth = this.getVisibleMapPixelWidth();
    const visiblePixelHeight = this.getVisibleMapPixelHeight();

    const totalWidth = visiblePixelWidth + this.padding * 2;
    const totalHeight = visiblePixelHeight + this.padding * 2;

    this.sceneContainer.x = this.game.screen.width - totalWidth - this.margin;
    this.sceneContainer.y = this.margin;

    this.viewportContainer.x = this.padding;
    this.viewportContainer.y = this.padding;

    this.playerGraphics.x = this.padding;
    this.playerGraphics.y = this.padding;
  }

  private drawFrame(): void {
    const visiblePixelWidth = this.getVisibleMapPixelWidth();
    const visiblePixelHeight = this.getVisibleMapPixelHeight();

    const totalWidth = visiblePixelWidth + this.padding * 2;
    const totalHeight = visiblePixelHeight + this.padding * 2;

    this.background.clear();
    this.background
      .roundRect(0, 0, totalWidth, totalHeight, this.borderRadius)
      .fill({ color: 0x000000, alpha: this.backgroundAlpha })
      .stroke({ color: 0xffffff, alpha: 0.25, width: 1 });
  }

  private drawMask(): void {
    const visiblePixelWidth = this.getVisibleMapPixelWidth();
    const visiblePixelHeight = this.getVisibleMapPixelHeight();

    this.maskGraphics.clear();
    this.maskGraphics
      .rect(0, 0, visiblePixelWidth, visiblePixelHeight)
      .fill({ color: 0xffffff });
  }

  private drawChunks(): void {
    this.contentContainer.removeChildren().forEach((child) => child.destroy());

    const player = this.mapService.playerCoordinate();
    const chunkSize = this.mapService.chunkSize;
    const chunkMap = this.mapService.chunkList();

    const playerChunkX = Math.floor(player.x / chunkSize);
    const playerChunkY = Math.floor(player.y / chunkSize);

    const startChunkX = playerChunkX - this.loadedChunkRadius;
    const endChunkX = playerChunkX + this.loadedChunkRadius;
    const startChunkY = playerChunkY - this.loadedChunkRadius;
    const endChunkY = playerChunkY + this.loadedChunkRadius;

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
        const chunkKey = `${chunkX}:${chunkY}`;
        const chunk = chunkMap.get(chunkKey);

        if (!chunk) {
          continue;
        }

        const chunkGraphics = new Graphics();

        for (const tile of chunk.tileList) {
          this.drawTile(chunkGraphics, tile);
        }

        this.contentContainer.addChild(chunkGraphics);
      }
    }
  }

  private drawTile(graphics: Graphics, tile: Tile): void {
    const px = tile.coordinate.x * this.cellSize;
    const py = tile.coordinate.y * this.cellSize;

    graphics
      .rect(px, py, this.cellSize, this.cellSize)
      .fill({ color: 0x4d7c4d });

    if (tile.hasRessource) {
      graphics
        .circle(
          px + this.cellSize / 2,
          py + this.cellSize / 2,
          Math.max(1.5, this.cellSize * 0.18),
        )
        .fill({ color: 0xd4b000 });
    }

    if (tile.hasMonster) {
      graphics
        .circle(
          px + this.cellSize / 2,
          py + this.cellSize / 2,
          Math.max(1.5, this.cellSize * 0.22),
        )
        .fill({ color: 0xb33939 });
    }
  }

  private positionContent(): void {
    const player = this.mapService.playerCoordinate();

    const visiblePixelWidth = this.getVisibleMapPixelWidth();
    const visiblePixelHeight = this.getVisibleMapPixelHeight();

    const playerCenterX = visiblePixelWidth / 2;
    const playerCenterY = visiblePixelHeight / 2;

    const offsetX =
      playerCenterX - (player.x * this.cellSize + this.cellSize / 2);
    const offsetY =
      playerCenterY - (player.y * this.cellSize + this.cellSize / 2);

    this.contentContainer.x = offsetX;
    this.contentContainer.y = offsetY;

    this.fogContainer.x = offsetX;
    this.fogContainer.y = offsetY;
  }

  private drawFog(): void {
    this.fogGraphics.clear();

    const player = this.mapService.playerCoordinate();
    const chunkSize = this.mapService.chunkSize;
    const chunkMap = this.mapService.chunkList();

    const playerChunkX = Math.floor(player.x / chunkSize);
    const playerChunkY = Math.floor(player.y / chunkSize);

    const startChunkX = playerChunkX - this.loadedChunkRadius;
    const endChunkX = playerChunkX + this.loadedChunkRadius;
    const startChunkY = playerChunkY - this.loadedChunkRadius;
    const endChunkY = playerChunkY + this.loadedChunkRadius;

    const fogColor = 0x050505;

    for (let chunkY = startChunkY; chunkY <= endChunkY; chunkY++) {
      for (let chunkX = startChunkX; chunkX <= endChunkX; chunkX++) {
        const chunkKey = `${chunkX}:${chunkY}`;
        const chunk = chunkMap.get(chunkKey);

        if (!chunk) {
          continue;
        }

        for (const tile of chunk.tileList) {
          const x = tile.coordinate.x;
          const y = tile.coordinate.y;

          if (this.isTileVisible(x, y, player.x, player.y)) {
            continue;
          }

          const px = x * this.cellSize;
          const py = y * this.cellSize;

          this.fogGraphics
            .rect(px, py, this.cellSize, this.cellSize)
            .fill({ color: fogColor });
        }
      }
    }
  }

  private isTileVisible(
    tileX: number,
    tileY: number,
    playerX: number,
    playerY: number,
  ): boolean {
    const dx = tileX - playerX;
    const dy = tileY - playerY;

    return dx * dx + dy * dy <= this.visionRadius * this.visionRadius;
  }

  private drawPlayer(): void {
    this.playerGraphics.clear();

    const centerX = this.getVisibleMapPixelWidth() / 2;
    const centerY = this.getVisibleMapPixelHeight() / 2;

    this.playerGraphics
      .circle(centerX, centerY, Math.max(2, this.cellSize / 3))
      .fill({ color: 0x00ff88 })
      .stroke({ color: 0xffffff, width: 1 });
  }

  private getVisibleMapPixelWidth(): number {
    return this.visibleTileWidth * this.cellSize;
  }

  private getVisibleMapPixelHeight(): number {
    return this.visibleTileHeight * this.cellSize;
  }
}
