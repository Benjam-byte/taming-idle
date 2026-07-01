import { Graphics } from 'pixi.js';
import { colors } from 'src/app/core/config/map-colors';
import { MinimapLayout } from './minimap-layout';
import { MinimapConfig } from './minimap-renderer.types';

export class MinimapFrameRenderer {
  constructor(
    private readonly shadow: Graphics,
    private readonly background: Graphics,
    private readonly innerBackground: Graphics,
    private readonly maskGraphics: Graphics,
    private readonly layout: MinimapLayout,
    private readonly config: MinimapConfig,
  ) {}

  render(): void {
    this.drawFrame();
    this.drawMask();
  }

  private drawFrame(): void {
    const { visiblePixelWidth, visiblePixelHeight, totalWidth, totalHeight } =
      this.layout.getSize();

    this.shadow.clear();
    this.shadow
      .roundRect(3, 5, totalWidth, totalHeight, this.config.borderRadius)
      .fill({ color: colors.shadow, alpha: 0.75 });

    this.background.clear();
    this.background
      .roundRect(0, 0, totalWidth, totalHeight, this.config.borderRadius)
      .fill({ color: colors.wood })
      .stroke({ color: colors.borderDark, width: 3 });

    this.background
      .roundRect(
        4,
        4,
        totalWidth - 8,
        totalHeight - 8,
        this.config.borderRadius - 4,
      )
      .stroke({ color: colors.borderLight, alpha: 0.35, width: 1 });

    this.innerBackground.clear();
    this.innerBackground
      .roundRect(
        this.config.padding - 2,
        this.config.padding - 2,
        visiblePixelWidth + 4,
        visiblePixelHeight + 4,
        8,
      )
      .fill({ color: colors.inset })
      .stroke({ color: colors.borderDark, width: 2 });
  }

  private drawMask(): void {
    const { visiblePixelWidth, visiblePixelHeight } = this.layout.getSize();

    this.maskGraphics.clear();
    this.maskGraphics
      .roundRect(0, 0, visiblePixelWidth, visiblePixelHeight, 6)
      .fill({ color: 0xffffff });
  }
}
