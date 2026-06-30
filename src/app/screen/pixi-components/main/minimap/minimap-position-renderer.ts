import { Text } from 'pixi.js';
import { MapService } from 'src/app/core/service/map/map-service';

export class MinimapPositionRenderer {
  constructor(
    private readonly positionText: Text,
    private readonly mapService: MapService,
  ) {}

  render(): void {
    const player = this.mapService.playerCoordinate();

    this.positionText.text = `x:${player.x} y:${player.y}`;
  }
}
