import { Coordinate } from '../../type/coordinate';
import { generateDiamondSquareGrid, Point } from './diamond-square';
import { Tile, TileGroundType, TileObstacleType } from './tile';

export class Chunk {
  size: number;
  centerCoordinate: Coordinate;
  monsterNumber: number;
  resourceNumber: number;
  tileList: Tile[];
  readonly tileMap = new Map<string, Tile>();

  constructor(
    size: number,
    coordinate: Coordinate,
    monsterNumber: number,
    resourceNumber: number,
  ) {
    this.size = size;
    this.centerCoordinate = coordinate;
    this.monsterNumber = monsterNumber;
    this.resourceNumber = resourceNumber;
    this.tileList = this.generateChunkTiles();
    for (const tile of this.tileList) {
      this.tileMap.set(`${tile.coordinate.x}:${tile.coordinate.y}`, tile);
    }
  }

  getTileAt(coordinate: Coordinate): Tile | undefined {
    return this.tileMap.get(`${coordinate.x}:${coordinate.y}`);
  }

  generateChunkTiles(): Tile[] {
    const grid = generateDiamondSquareGrid();
    const tiles = this.createTilesFromGrid(grid);
    const shuffledIndexes = this.getDeterministicShuffledIndexes(tiles.length);

    this.assignMonsters(tiles, shuffledIndexes);
    this.assignRessources(tiles, shuffledIndexes);

    return tiles;
  }

  private createTilesFromGrid(grid: Point[][]): Tile[] {
    const tiles: Tile[] = [];

    const gridSize = grid.length;
    const halfSize = Math.floor(gridSize / 2);

    for (let gridY = 0; gridY < gridSize; gridY++) {
      for (let gridX = 0; gridX < gridSize; gridX++) {
        const point = grid[gridX][gridY];

        const worldX = this.centerCoordinate.x + point.posX - halfSize;
        const worldY = this.centerCoordinate.y + point.posY - halfSize;

        tiles.push(
          this.createTileFromPoint(point, {
            x: worldX,
            y: worldY,
          }),
        );
      }
    }

    return tiles;
  }

  private assignMonsters(tiles: Tile[], shuffledIndexes: number[]): void {
    const walkableIndexes = shuffledIndexes.filter(
      (index) => tiles[index].isWalkable,
    );

    const maxMonsterCount = Math.min(
      this.monsterNumber,
      walkableIndexes.length,
    );

    for (let i = 0; i < maxMonsterCount; i++) {
      const tileIndex = walkableIndexes[i];
      tiles[tileIndex].hasMonster = true;
    }
  }

  private assignRessources(tiles: Tile[], shuffledIndexes: number[]): void {
    const walkableIndexes = shuffledIndexes.filter(
      (index) => tiles[index].isWalkable && !tiles[index].hasMonster,
    );

    const maxResourceCount = Math.min(
      this.resourceNumber,
      walkableIndexes.length,
    );

    for (let i = 0; i < maxResourceCount; i++) {
      const tileIndex = walkableIndexes[i];
      tiles[tileIndex].hasResource = true;
    }
  }

  private getDeterministicShuffledIndexes(length: number): number[] {
    const indexes = this.createIndexes(length);
    let seed = this.getChunkSeed();

    for (let i = indexes.length - 1; i > 0; i--) {
      seed = this.nextSeed(seed);
      const randomIndex = seed % (i + 1);
      this.swapIndexes(indexes, i, randomIndex);
    }

    return indexes;
  }

  private createIndexes(length: number): number[] {
    return Array.from({ length }, (_, index) => index);
  }

  private swapIndexes(
    indexes: number[],
    firstIndex: number,
    secondIndex: number,
  ): void {
    [indexes[firstIndex], indexes[secondIndex]] = [
      indexes[secondIndex],
      indexes[firstIndex],
    ];
  }

  private getChunkSeed(): number {
    return Math.abs(
      this.centerCoordinate.x * 73856093 + this.centerCoordinate.y * 19349663,
    );
  }

  private nextSeed(seed: number): number {
    return (seed * 1664525 + 1013904223) >>> 0;
  }

  private hash2D(x: number, y: number, seed = 1337): number {
    let h = x * 374761393 + y * 668265263 + seed * 1442695041;
    h = (h ^ (h >> 13)) * 1274126177;
    h = h ^ (h >> 16);

    return Math.abs(h % 10000) / 10000;
  }

  private getTileAssetPath(
    x: number,
    y: number,
    groundType: TileGroundType,
  ): string {
    if (groundType === 'clearing') {
      return this.getClearingVariant(x, y);
    }

    return groundType;
  }

  private getClearingVariant(x: number, y: number): string {
    const variants = [
      'plaine1',
      'plaine2',
      'plaine3',
      'plaine4',
      'plaine5',
      'plaine6',
    ];
    const index = Math.floor(this.hash2D(x, y, 500) * variants.length);

    return variants[index];
  }

  private createTileFromPoint(point: Point, coordinate: Coordinate): Tile {
    const groundType = this.getGroundTypeFromHeight(point.height);
    const obstacleType = this.getObstacleTypeFromHeight(point.height);

    return new Tile(
      this.getTileAssetPath(coordinate.x, coordinate.y, groundType),
      coordinate,
      groundType,
      obstacleType,
    );
  }

  private getGroundTypeFromHeight(height: number): TileGroundType {
    if (height <= 4) return 'lake';
    if (height <= 8) return 'clearing';
    if (height <= 12) return 'darkClearing';
    return 'stoneQuarry';
  }

  private getObstacleTypeFromHeight(height: number): TileObstacleType {
    if (height === 1) return 'lake';
    if (height === 11) return 'grove';

    return null;
  }
}
