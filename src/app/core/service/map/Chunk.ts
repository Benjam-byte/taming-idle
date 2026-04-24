import { Coordinate } from '../../type/coordinate';
import { Tile } from './tile';

export class Chunk {
  size: number;
  centerCoordinate: Coordinate;
  monsterNumber: number;
  resourceNumber: number;
  tileList: Tile[];

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
  }

  generateChunkTiles(): Tile[] {
    const tiles = this.createEmptyTiles();
    const shuffledIndexes = this.getDeterministicShuffledIndexes(tiles.length);

    this.assignMonsters(tiles, shuffledIndexes);
    this.assignRessources(tiles, shuffledIndexes);

    return tiles;
  }

  private createEmptyTiles(): Tile[] {
    const tiles: Tile[] = [];
    const halfSize = Math.floor(this.size / 2);

    for (
      let y = this.centerCoordinate.y - halfSize;
      y <= this.centerCoordinate.y + halfSize;
      y++
    ) {
      for (
        let x = this.centerCoordinate.x - halfSize;
        x <= this.centerCoordinate.x + halfSize;
        x++
      ) {
        tiles.push(this.createTile(x, y));
      }
    }

    return tiles;
  }

  private createTile(x: number, y: number): Tile {
    return new Tile('', { x, y }, false, false);
  }

  private assignMonsters(tiles: Tile[], shuffledIndexes: number[]): void {
    const maxMonsterCount = Math.min(
      this.monsterNumber,
      shuffledIndexes.length,
    );

    for (let i = 0; i < maxMonsterCount; i++) {
      const tileIndex = shuffledIndexes[i];
      tiles[tileIndex].hasMonster = true;
    }
  }

  private assignRessources(tiles: Tile[], shuffledIndexes: number[]): void {
    const startIndex = this.monsterNumber;
    const endIndex = Math.min(
      this.monsterNumber + this.resourceNumber,
      shuffledIndexes.length,
    );

    for (let i = startIndex; i < endIndex; i++) {
      const tileIndex = shuffledIndexes[i];
      tiles[tileIndex].hasRessource = true;
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
}
