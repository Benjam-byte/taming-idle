import { Coordinate } from '../../type/coordinate';

export type TileGroundType =
  | 'clearing'
  | 'darkClearing'
  | 'stoneQuarry'
  | 'lake';

export type TileObstacleType = 'lake' | 'grove' | null;
export type TileSpecialType = 'burrow' | null;

export class Tile {
  constructor(
    public path: string,
    public coordinate: Coordinate,
    public groundType: TileGroundType,
    public obstacleType: TileObstacleType = null,
    public hasMonster = false,
    public hasResource = false,
    public specialType: TileSpecialType = null,
  ) {}

  get isWalkable(): boolean {
    return this.obstacleType === null;
  }

  collectResource(): void {
    this.hasResource = false;
  }

  killMonster(): void {
    this.hasMonster = false;
  }
}
