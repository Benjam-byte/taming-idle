import { Coordinate } from '../../type/coordinate';

export class Tile {
  path: string;
  coordinate: Coordinate;
  hasMonster: boolean;
  hasRessource: boolean;

  constructor(
    path: string,
    coordinate: Coordinate,
    hasMonster = false,
    hasRessource = false,
  ) {
    this.path = path;
    this.coordinate = coordinate;
    this.hasMonster = hasMonster;
    this.hasRessource = hasRessource;
  }
}
