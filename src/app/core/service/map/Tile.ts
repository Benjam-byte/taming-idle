import { Coordinate } from '../../type/coordinate';

export class Tile {
  path: string;
  coordinate: Coordinate;
  hasMonster: boolean;
  hasResource: boolean;

  constructor(
    path: string,
    coordinate: Coordinate,
    hasMonster = false,
    hasResource = false,
  ) {
    this.path = path;
    this.coordinate = coordinate;
    this.hasMonster = hasMonster;
    this.hasResource = hasResource;
  }

  collectResource() {
    this.hasResource = false;
  }
}
