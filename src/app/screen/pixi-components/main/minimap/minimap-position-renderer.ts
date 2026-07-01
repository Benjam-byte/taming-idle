import { Text } from 'pixi.js';
import { MapStore } from 'src/app/core/service/map/map.store';

export class MinimapPositionRenderer {
  constructor(
    private readonly positionText: Text,
    private readonly mapService: MapStore,
  ) {}

  render(): void {
    const player = this.mapService.playerCoordinate();

    this.positionText.text = `x:${player.x} y:${player.y}`;
  }
}
