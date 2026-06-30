import { Graphics } from 'pixi.js';
import { colors } from 'src/app/core/config/map-colors';
import { Tile } from 'src/app/core/service/map/tile';
import { MinimapConfig } from './minimap-renderer.types';

export class MinimapTileIconsRenderer {
  constructor(private readonly config: MinimapConfig) {}

  drawObstacleIcon(
    graphics: Graphics,
    px: number,
    py: number,
    obstacleType: NonNullable<Tile['obstacleType']>,
    alpha: number,
  ): void {
    const cx = px + this.config.cellSize / 2;
    const cy = py + this.config.cellSize / 2;

    if (obstacleType === 'lake') {
      graphics
        .ellipse(cx, cy, 5.5, 3.5)
        .fill({ color: 0x8fd3ff, alpha: alpha * 0.7 });

      graphics
        .ellipse(cx - 1.5, cy - 1, 2.5, 1.2)
        .fill({ color: 0xd8f2ff, alpha: alpha * 0.55 });

      return;
    }

    if (obstacleType === 'grove') {
      graphics
        .circle(cx - 2.5, cy + 1, 3.2)
        .fill({ color: 0x0f2f16, alpha: alpha * 0.8 });

      graphics
        .circle(cx, cy - 2, 3.8)
        .fill({ color: 0x143d1d, alpha: alpha * 0.9 });

      graphics
        .circle(cx + 2.8, cy + 1, 3.2)
        .fill({ color: 0x0f2f16, alpha: alpha * 0.8 });
    }
  }

  drawResourceIcon(
    graphics: Graphics,
    px: number,
    py: number,
    alpha: number,
  ): void {
    const cx = px + this.config.cellSize / 2;
    const cy = py + this.config.cellSize / 2;

    graphics
      .circle(cx, cy, 3.2)
      .fill({ color: colors.resource, alpha })
      .stroke({ color: colors.borderDark, width: 1 });

    graphics
      .circle(cx - 1, cy - 1, 1)
      .fill({ color: 0xfff3d0, alpha: alpha * 0.75 });
  }

  drawMonsterIcon(
    graphics: Graphics,
    px: number,
    py: number,
    alpha: number,
  ): void {
    const cx = px + this.config.cellSize / 2;
    const cy = py + this.config.cellSize / 2;

    graphics
      .circle(cx, cy, 4)
      .fill({ color: colors.monster, alpha })
      .stroke({ color: colors.borderDark, width: 1 });

    graphics.circle(cx - 1.3, cy - 0.7, 0.7).fill({ color: 0x2a1a10, alpha });
    graphics.circle(cx + 1.3, cy - 0.7, 0.7).fill({ color: 0x2a1a10, alpha });

    graphics
      .rect(cx - 1.8, cy + 1.2, 3.6, 0.9)
      .fill({ color: 0x2a1a10, alpha: alpha * 0.75 });
  }
}
