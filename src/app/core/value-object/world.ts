type availableMap =
  | 'plaine'
  | 'volcan'
  | 'fight tower'
  | 'bermude'
  | 'wind moutain'
  | 'forest';

export default class World {
  mapUnlocked: availableMap[];
  map: availableMap;

  constructor() {
    this.map = 'plaine';
    this.mapUnlocked = ['plaine'];
  }
}
