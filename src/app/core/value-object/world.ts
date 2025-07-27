type availableMap =
  | 'plaine'
  | 'volcan'
  | 'fight tower'
  | 'bermude'
  | 'wind moutain'
  | 'forest';

export default class World {
  map: availableMap;

  constructor() {
    this.map = 'plaine';
  }
}
