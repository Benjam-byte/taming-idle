import { Graphics } from 'pixi.js';
import { colors } from 'src/app/core/config/map-colors';
import { MinimapLayout } from './minimap-layout';
import { MinimapConfig } from './minimap-renderer.types';

export class MinimapOpenMapButtonRenderer {
  private readonly size = 22;
  private readonly handleOpenMap = (): void => {
    this.onOpenFullMap();
  };

  constructor(
    private readonly openMapButton: Graphics,
    private readonly layout: MinimapLayout,
    private readonly config: MinimapConfig,
    private readonly onOpenFullMap: () => void,
  ) {}

  init(): void {
    this.openMapButton.eventMode = 'static';
    this.openMapButton.cursor = 'pointer';
    this.openMapButton.removeAllListeners();
    this.openMapButton.on('pointertap', this.handleOpenMap);
  }

  render(): void {
    const { visiblePixelWidth, visiblePixelHeight } = this.layout.getSize();

    const x = this.config.padding + visiblePixelWidth - this.size - 4;
    const y = this.config.padding + visiblePixelHeight - this.size - 4;

    this.openMapButton.clear();

    this.openMapButton
      .roundRect(x, y, this.size, this.size, 6)
      .fill({ color: colors.woodLight })
      .stroke({ color: colors.playerBorder, width: 2 });

    this.openMapButton
      .rect(x + 6, y + 6, 4, 4)
      .fill({ color: colors.playerBorder });

    this.openMapButton
      .rect(x + 13, y + 6, 4, 4)
      .fill({ color: colors.playerBorder });

    this.openMapButton
      .rect(x + 6, y + 13, 4, 4)
      .fill({ color: colors.playerBorder });

    this.openMapButton
      .rect(x + 13, y + 13, 4, 4)
      .fill({ color: colors.playerBorder });
  }

  destroy(): void {
    this.openMapButton.removeAllListeners();
  }
}
