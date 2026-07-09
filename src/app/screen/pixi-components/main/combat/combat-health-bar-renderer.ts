import {
  AnimatedSprite,
  Application,
  Container,
  Graphics,
  Text,
  TextStyle,
} from 'pixi.js';
import { easeInQuad, easeOutCubic } from '../utils/easing';
import {
  TickerAnimationHandle,
  TickerAnimationRunner,
} from '../utils/ticker-animation-runner';

export type CombatHealthValue = {
  current: number;
  max: number;
};

export type CombatHealthBarsState = {
  monster: CombatHealthValue;
  player: CombatHealthValue;
};

type CombatHealthBarTarget = 'monster' | 'player';

type CombatHealthBarTargets = Record<
  CombatHealthBarTarget,
  () => AnimatedSprite | undefined
>;

const HEALTH_GREEN = 0x6fa348;
const HEALTH_YELLOW = 0xd6b44a;
const HEALTH_RED = 0xc94b3d;
const HEALTH_TRACK = 0x20150d;
const HEALTH_BORDER = 0x140c07;
const HEALTH_TEXT = 0xfff3d0;
const HEALTH_BAR_Z_INDEX = 24;
const HEALTH_BAR_GAP = 8;
const HEALTH_WARNING_THRESHOLD = 0.35;
const HEALTH_CRITICAL_THRESHOLD = 0.1;
const HEALTH_BAR_HORIZONTAL_MARGIN = 24;
const HEALTH_BAR_MOBILE_BREAKPOINT = 480;

export class CombatHealthBarRenderer {
  private readonly bars: Record<CombatHealthBarTarget, CombatHealthBarView>;
  private followHandle?: TickerAnimationHandle;
  private isVisible = false;

  constructor(
    private readonly game: Application,
    sceneContainer: Container,
    private readonly animationRunner: TickerAnimationRunner,
    targets: CombatHealthBarTargets,
  ) {
    this.bars = {
      monster: new CombatHealthBarView(
        sceneContainer,
        animationRunner,
        targets.monster,
      ),
      player: new CombatHealthBarView(
        sceneContainer,
        animationRunner,
        targets.player,
      ),
    };
  }

  setVisible(isVisible: boolean): void {
    if (this.isVisible === isVisible) {
      return;
    }

    this.isVisible = isVisible;

    if (isVisible) {
      this.startFollowingTargets();
      this.layoutBars();
      return;
    }

    this.stopFollowingTargets();
    this.bars.monster.reset();
    this.bars.player.reset();
  }

  setHealthBars(state: CombatHealthBarsState): void {
    this.bars.monster.setHealth(state.monster);
    this.bars.player.setHealth(state.player);

    if (this.isVisible) {
      this.startFollowingTargets();
      this.layoutBars();
    }
  }

  destroy(): void {
    this.stopFollowingTargets();
    this.bars.monster.destroy();
    this.bars.player.destroy();
  }

  private startFollowingTargets(): void {
    if (this.followHandle) {
      return;
    }

    this.followHandle = this.animationRunner.start(() => {
      this.layoutBars();
      return false;
    });
  }

  private stopFollowingTargets(): void {
    if (!this.followHandle) {
      return;
    }

    this.followHandle.stop();
    this.followHandle = undefined;
  }

  private layoutBars(): void {
    this.bars.monster.layout(this.game.screen.width);
    this.bars.player.layout(this.game.screen.width);
  }
}

class CombatHealthBarView {
  private readonly container = new Container();
  private readonly background = new Graphics();
  private readonly track = new Graphics();
  private readonly fill = new Graphics();
  private readonly highlight = new Graphics();
  private readonly valueText = new Text({
    text: '0/0',
    style: new TextStyle({
      fontFamily: 'Arial',
      fontSize: 12,
      fontWeight: '900',
      fill: HEALTH_TEXT,
      stroke: {
        color: HEALTH_BORDER,
        width: 3,
      },
      dropShadow: {
        color: 0x000000,
        blur: 2,
        angle: Math.PI / 2,
        distance: 2,
        alpha: 0.45,
      },
    }),
  });

  private current = 0;
  private max = 0;
  private displayedPercent = 0;
  private targetPercent = 0;
  private width = 140;
  private height = 20;
  private hasInitializedHealth = false;
  private fillAnimation?: TickerAnimationHandle;
  private readonly fallingSegments = new Set<{
    graphic: Graphics;
    handle: TickerAnimationHandle;
  }>();

  constructor(
    sceneContainer: Container,
    private readonly animationRunner: TickerAnimationRunner,
    private readonly getTarget: () => AnimatedSprite | undefined,
  ) {
    this.container.eventMode = 'none';
    this.container.sortableChildren = true;
    this.container.visible = false;
    this.container.zIndex = HEALTH_BAR_Z_INDEX;

    this.background.zIndex = 0;
    this.track.zIndex = 1;
    this.fill.zIndex = 2;
    this.highlight.zIndex = 3;
    this.valueText.zIndex = 5;
    this.valueText.anchor.set(0.5);

    this.container.addChild(
      this.background,
      this.track,
      this.fill,
      this.highlight,
      this.valueText,
    );

    sceneContainer.addChild(this.container);
    this.render();
  }

  setHealth(health: CombatHealthValue): void {
    const nextMax = Math.max(0, Math.floor(health.max));
    const nextCurrent =
      nextMax > 0
        ? Math.min(Math.max(0, Math.floor(health.current)), nextMax)
        : 0;
    const nextPercent = nextMax > 0 ? nextCurrent / nextMax : 0;
    const hadHealth = this.hasInitializedHealth;
    const previousCurrent = this.current;
    const previousPercent = this.displayedPercent;

    this.current = nextCurrent;
    this.max = nextMax;
    this.targetPercent = nextPercent;
    this.valueText.text = `${nextCurrent}/${nextMax}`;
    this.updateDimensions();

    if (!hadHealth) {
      this.hasInitializedHealth = true;
      this.displayedPercent = nextPercent;
      this.render();
      return;
    }

    if (nextCurrent < previousCurrent && nextPercent < previousPercent) {
      this.createFallingSegment(previousPercent, nextPercent);
    }

    this.animateFillTo(nextPercent);
    this.render();
  }

  layout(screenWidth: number): void {
    const target = this.getTarget();

    if (!target || target.destroyed || !target.visible || this.max <= 0) {
      this.container.visible = false;
      return;
    }

    this.updateDimensions(target.width, screenWidth);
    this.container.visible = true;
    this.container.x = target.x;
    this.container.y = Math.max(
      this.height / 2 + 4,
      target.y - target.height / 2 - HEALTH_BAR_GAP,
    );
    this.render();
  }

  reset(): void {
    this.stopFillAnimation();
    this.clearFallingSegments();

    this.current = 0;
    this.max = 0;
    this.displayedPercent = 0;
    this.targetPercent = 0;
    this.hasInitializedHealth = false;
    this.valueText.text = '0/0';
    this.container.visible = false;
    this.render();
  }

  destroy(): void {
    this.stopFillAnimation();
    this.clearFallingSegments();
    this.container.removeFromParent();
    this.container.destroy({ children: true });
  }

  private animateFillTo(nextPercent: number): void {
    this.stopFillAnimation();

    const startPercent = this.displayedPercent;

    if (Math.abs(startPercent - nextPercent) < 0.001) {
      this.displayedPercent = nextPercent;
      this.render();
      return;
    }

    const duration = nextPercent < startPercent ? 360 : 260;
    let elapsed = 0;

    const handle = this.animationRunner.start((ticker) => {
      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      this.displayedPercent =
        startPercent + (nextPercent - startPercent) * easedProgress;
      this.render();

      if (progress < 1) {
        return false;
      }

      this.displayedPercent = nextPercent;
      this.render();

      return true;
    });

    this.fillAnimation = handle;

    void handle.promise.finally(() => {
      if (this.fillAnimation === handle) {
        this.fillAnimation = undefined;
      }
    });
  }

  private stopFillAnimation(): void {
    if (!this.fillAnimation) {
      return;
    }

    this.fillAnimation.stop();
    this.fillAnimation = undefined;
  }

  private createFallingSegment(
    previousPercent: number,
    nextPercent: number,
  ): void {
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();
    const segmentPercent = previousPercent - nextPercent;
    const segmentWidth = Math.max(4, innerWidth * segmentPercent);

    if (segmentWidth <= 0) {
      return;
    }

    const startX = -innerWidth / 2 + innerWidth * nextPercent + segmentWidth / 2;
    const segment = new Graphics();

    segment.roundRect(
      -segmentWidth / 2,
      -innerHeight / 2,
      segmentWidth,
      innerHeight,
      Math.min(innerHeight / 2, segmentWidth / 2),
    );
    segment.fill({ color: this.getColor(previousPercent), alpha: 1 });
    segment.x = startX;
    segment.y = 0;
    segment.zIndex = 4;

    this.container.addChild(segment);

    let elapsed = 0;
    const duration = 560;
    const fallDirection = Math.random() > 0.5 ? 1 : -1;
    const startRotation = fallDirection * 0.05;

    const handle = this.animationRunner.start((ticker) => {
      if (segment.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);
      const fadeProgress =
        progress < 0.25 ? 0 : Math.min((progress - 0.25) / 0.75, 1);

      segment.x =
        startX + Math.sin(progress * Math.PI * 1.4) * fallDirection * 10;
      segment.y = easeInQuad(progress) * 24 + Math.sin(progress * Math.PI) * 4;
      segment.rotation = startRotation + fallDirection * easeOut * 0.45;
      segment.alpha = 1 - easeOutCubic(fadeProgress);

      if (progress < 1) {
        return false;
      }

      this.destroyFallingSegment(segment);

      return true;
    });

    this.fallingSegments.add({ graphic: segment, handle });
  }

  private destroyFallingSegment(segment: Graphics): void {
    for (const entry of this.fallingSegments) {
      if (entry.graphic === segment) {
        this.fallingSegments.delete(entry);
        break;
      }
    }

    if (!segment.destroyed) {
      segment.removeFromParent();
      segment.destroy();
    }
  }

  private clearFallingSegments(): void {
    for (const { graphic, handle } of this.fallingSegments) {
      handle.stop();

      if (!graphic.destroyed) {
        graphic.removeFromParent();
        graphic.destroy();
      }
    }

    this.fallingSegments.clear();
  }

  private updateDimensions(targetWidth = 0, screenWidth = 0): void {
    const isMobile = screenWidth <= HEALTH_BAR_MOBILE_BREAKPOINT;
    const maxWidth =
      screenWidth > 0
        ? Math.max(112, screenWidth - HEALTH_BAR_HORIZONTAL_MARGIN)
        : isMobile
          ? 176
          : 220;
    const spriteWidth = Math.max(0, targetWidth);
    const responsiveWidth = Math.max(
      isMobile ? 118 : 136,
      spriteWidth * 0.68,
    );
    const textWidth = Math.ceil(this.valueText.width) + 38;

    this.width = Math.min(maxWidth, Math.max(responsiveWidth, textWidth));
    this.height = isMobile ? 18 : 20;
  }

  private render(): void {
    const innerWidth = this.getInnerWidth();
    const innerHeight = this.getInnerHeight();
    const fillWidth = Math.max(
      this.current > 0 ? 4 : 0,
      innerWidth * this.displayedPercent,
    );
    const fillRadius = Math.min(innerHeight / 2, fillWidth / 2);

    this.background.clear();
    this.background.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      this.height / 2,
    );
    this.background.fill({ color: HEALTH_BORDER, alpha: 0.9 });

    this.track.clear();
    this.track.roundRect(
      -innerWidth / 2,
      -innerHeight / 2,
      innerWidth,
      innerHeight,
      innerHeight / 2,
    );
    this.track.fill({ color: HEALTH_TRACK, alpha: 0.88 });

    this.fill.clear();

    if (fillWidth > 0) {
      this.fill.roundRect(
        -innerWidth / 2,
        -innerHeight / 2,
        fillWidth,
        innerHeight,
        fillRadius,
      );
      this.fill.fill({
        color: this.getColor(this.targetPercent),
        alpha: 1,
      });
    }

    this.highlight.clear();
    this.highlight.roundRect(
      -innerWidth / 2 + 2,
      -innerHeight / 2 + 2,
      Math.max(0, innerWidth - 4),
      Math.max(0, innerHeight * 0.35),
      Math.max(0, innerHeight * 0.18),
    );
    this.highlight.fill({ color: 0xffffff, alpha: 0.16 });

    this.valueText.x = 0;
    this.valueText.y = 0;
  }

  private getInnerWidth(): number {
    return Math.max(0, this.width - 8);
  }

  private getInnerHeight(): number {
    return Math.max(0, this.height - 8);
  }

  private getColor(percent: number): number {
    if (percent < HEALTH_CRITICAL_THRESHOLD) {
      return HEALTH_RED;
    }

    if (percent < HEALTH_WARNING_THRESHOLD) {
      return HEALTH_YELLOW;
    }

    return HEALTH_GREEN;
  }
}
