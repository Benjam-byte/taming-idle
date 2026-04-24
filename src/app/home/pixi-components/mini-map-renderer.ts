import { Application, Container, Graphics, Text } from 'pixi.js';
import { MapService } from 'src/app/core/service/map/map-service';
import { Tile } from 'src/app/core/service/map/tile';

export class MinimapRenderer {
  private readonly sceneContainer = new Container();
  private readonly shadow = new Graphics();
  private readonly background = new Graphics();
  private readonly innerBackground = new Graphics();

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
  private readonly padding = 9;
  private readonly margin = 16;
  private readonly borderRadius = 14;

  private readonly colors = {
    shadow: 0x140c07,
    borderDark: 0x2a1a10,
    borderLight: 0x6b4729,
    wood: 0x573820,
    woodLight: 0x6b4729,
    inset: 0x20150d,

    tile: 0x4f7f35,
    tileAlt: 0x426f2c,
    tileLine: 0x2f4f20,

    fog: 0x1b130d,
    fogLine: 0x2a1a10,

    resource: 0xd5a13a,
    monster: 0x9f3f2f,
    player: 0x6ee08f,
    playerBorder: 0xfff3d0,
  };

  private readonly positionText = new Text({
    text: 'x: 0  y: 0',
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

    this.sceneContainer.addChild(this.shadow);
    this.sceneContainer.addChild(this.background);
    this.sceneContainer.addChild(this.innerBackground);
    this.sceneContainer.addChild(this.viewportContainer);
    this.sceneContainer.addChild(this.playerGraphics);
    this.sceneContainer.addChild(this.positionText);

    this.container.addChild(this.sceneContainer);

    this.render();
  }

  render(): void {
    this.layout();
    this.drawFrame();
    this.drawMask();
    this.drawChunks();
    this.positionContent();
    this.drawFog();
    this.drawPlayer();
    this.drawPosition();
  }

  destroy(): void {
    if (this.sceneContainer.parent) {
      this.sceneContainer.parent.removeChild(this.sceneContainer);
    }

    this.sceneContainer.destroy({ children: true });
  }

  private layout(): void {
    const visiblePixelWidth = this.getVisibleMapPixelWidth();

    const totalWidth = visiblePixelWidth + this.padding * 2;

    this.sceneContainer.x = this.game.screen.width - totalWidth - this.margin;
    this.sceneContainer.y = this.margin;

    this.viewportContainer.x = this.padding;
    this.viewportContainer.y = this.padding;

    this.playerGraphics.x = this.padding;
    this.playerGraphics.y = this.padding;

    this.positionText.x = 15;
    this.positionText.y = 10;
  }

  private drawPosition(): void {
    const player = this.mapService.playerCoordinate();

    this.positionText.text = `x:${player.x} y:${player.y}`;
  }

  private drawFrame(): void {
    const visiblePixelWidth = this.getVisibleMapPixelWidth();
    const visiblePixelHeight = this.getVisibleMapPixelHeight();

    const totalWidth = visiblePixelWidth + this.padding * 2;
    const totalHeight = visiblePixelHeight + this.padding * 2;

    this.shadow.clear();
    this.shadow
      .roundRect(3, 5, totalWidth, totalHeight, this.borderRadius)
      .fill({ color: this.colors.shadow, alpha: 0.75 });

    this.background.clear();
    this.background
      .roundRect(0, 0, totalWidth, totalHeight, this.borderRadius)
      .fill({ color: this.colors.wood })
      .stroke({ color: this.colors.borderDark, width: 3 });

    this.background
      .roundRect(4, 4, totalWidth - 8, totalHeight - 8, this.borderRadius - 4)
      .stroke({ color: this.colors.borderLight, alpha: 0.35, width: 1 });

    this.innerBackground.clear();
    this.innerBackground
      .roundRect(
        this.padding - 2,
        this.padding - 2,
        visiblePixelWidth + 4,
        visiblePixelHeight + 4,
        8,
      )
      .fill({ color: this.colors.inset })
      .stroke({ color: this.colors.borderDark, width: 2 });
  }

  private drawMask(): void {
    const visiblePixelWidth = this.getVisibleMapPixelWidth();
    const visiblePixelHeight = this.getVisibleMapPixelHeight();

    this.maskGraphics.clear();
    this.maskGraphics
      .roundRect(0, 0, visiblePixelWidth, visiblePixelHeight, 6)
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

    const isAlt = Math.abs(tile.coordinate.x + tile.coordinate.y) % 2 === 0;
    const tileColor = isAlt ? this.colors.tile : this.colors.tileAlt;

    graphics
      .rect(px, py, this.cellSize, this.cellSize)
      .fill({ color: tileColor });

    graphics
      .rect(px, py, this.cellSize, this.cellSize)
      .stroke({ color: this.colors.tileLine, alpha: 0.22, width: 1 });

    if (tile.hasRessource) {
      this.drawResourceIcon(graphics, px, py);
    }

    if (tile.hasMonster) {
      this.drawMonsterIcon(graphics, px, py);
    }
  }

  private drawResourceIcon(graphics: Graphics, px: number, py: number): void {
    const cx = px + this.cellSize / 2;
    const cy = py + this.cellSize / 2;

    graphics
      .circle(cx, cy, 3.2)
      .fill({ color: this.colors.resource })
      .stroke({ color: this.colors.borderDark, width: 1 });

    graphics.circle(cx - 1, cy - 1, 1).fill({ color: 0xfff3d0, alpha: 0.75 });
  }

  private drawMonsterIcon(graphics: Graphics, px: number, py: number): void {
    const cx = px + this.cellSize / 2;
    const cy = py + this.cellSize / 2;

    graphics
      .circle(cx, cy, 4)
      .fill({ color: this.colors.monster })
      .stroke({ color: this.colors.borderDark, width: 1 });

    graphics.circle(cx - 1.3, cy - 0.7, 0.7).fill({ color: 0x2a1a10 });
    graphics.circle(cx + 1.3, cy - 0.7, 0.7).fill({ color: 0x2a1a10 });

    graphics
      .rect(cx - 1.8, cy + 1.2, 3.6, 0.9)
      .fill({ color: 0x2a1a10, alpha: 0.75 });
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
            .fill({ color: this.colors.fog, alpha: 0.96 });

          this.fogGraphics
            .rect(px, py, this.cellSize, this.cellSize)
            .stroke({ color: this.colors.fogLine, alpha: 0.5, width: 1 });
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
      .circle(centerX + 1, centerY + 2, 5)
      .fill({ color: this.colors.shadow, alpha: 0.55 });

    this.playerGraphics
      .circle(centerX, centerY, 5)
      .fill({ color: this.colors.player })
      .stroke({ color: this.colors.playerBorder, width: 1.5 });

    this.playerGraphics
      .circle(centerX - 1.5, centerY - 1.5, 1.4)
      .fill({ color: 0xffffff, alpha: 0.7 });
  }

  private getVisibleMapPixelWidth(): number {
    return this.visibleTileWidth * this.cellSize;
  }

  private getVisibleMapPixelHeight(): number {
    return this.visibleTileHeight * this.cellSize;
  }
}
