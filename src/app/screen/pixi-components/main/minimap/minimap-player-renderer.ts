import { Graphics } from 'pixi.js';
import { colors } from 'src/app/core/config/map-colors';
import { MinimapLayout } from './minimap-layout';

export class MinimapPlayerRenderer {
  constructor(
    private readonly playerGraphics: Graphics,
    private readonly layout: MinimapLayout,
  ) {}

  render(): void {
    this.playerGraphics.clear();

    const center = this.layout.getPlayerCenter();

    this.playerGraphics
      .circle(center.x + 1, center.y + 2, 5)
      .fill({ color: colors.shadow, alpha: 0.55 });

    this.playerGraphics
      .circle(center.x, center.y, 5)
      .fill({ color: colors.player })
      .stroke({ color: colors.playerBorder, width: 1.5 });

    this.playerGraphics
      .circle(center.x - 1.5, center.y - 1.5, 1.4)
      .fill({ color: 0xffffff, alpha: 0.7 });
  }
}
