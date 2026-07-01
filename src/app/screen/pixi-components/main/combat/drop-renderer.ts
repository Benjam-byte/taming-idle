import { Container, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { easeOutCubic } from '../utils/easing';
import {
  TickerAnimationHandle,
  TickerAnimationRunner,
} from '../utils/ticker-animation-runner';
import { DropType, MonsterDropReward } from '../map-scene-renderer.types';

type DropInfo = {
  type: DropType;
  texture: Texture;
};

type DropState = {
  type: DropType;
  targetX: number;
  targetY: number;
  delay: number;
  baseScaleX: number;
  baseScaleY: number;
};

export class DropRenderer {
  private readonly activeDrops = new Set<Sprite>();
  private readonly activeTexts = new Set<Text>();
  private readonly dropStates = new WeakMap<Sprite, DropState>();
  private readonly animationHandles = new Set<TickerAnimationHandle>();
  private isDestroyed = false;

  constructor(
    private readonly animationRunner: TickerAnimationRunner,
    private readonly sceneContainer: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly onDropClick: (dropType: DropType) => void,
  ) { }

  async playMonsterDropAnimation(
    originX: number,
    originY: number,
    reward: MonsterDropReward,
  ): Promise<void> {
    const drops = this.createDrops(originX, originY, reward);

    if (drops.length === 0) {
      return;
    }

    let elapsed = 0;
    const duration = 620;

    await this.runTrackedAnimation((ticker) => {
      elapsed += ticker.deltaMS;

      let allDone = true;

      for (const drop of drops) {
        if (drop.destroyed) {
          continue;
        }

        const state = this.dropStates.get(drop);

        if (!state) {
          continue;
        }

        const localElapsed = elapsed - state.delay;

        if (localElapsed < 0) {
          allDone = false;
          continue;
        }

        const progress = Math.min(localElapsed / duration, 1);
        const easeOut = easeOutCubic(progress);
        const arc = Math.sin(progress * Math.PI) * 32;

        drop.alpha = progress < 0.15 ? progress / 0.15 : 1;
        drop.x = originX + (state.targetX - originX) * easeOut;
        drop.y = originY + (state.targetY - originY) * easeOut - arc;
        drop.rotation += 0.045;

        const pop = Math.sin(progress * Math.PI) * 0.18;
        drop.scale.set(
          state.baseScaleX * (1 + pop),
          state.baseScaleY * (1 + pop),
        );

        if (progress < 1) {
          allDone = false;
        }
      }

      return allDone;
    });

    if (this.isDestroyed) {
      return;
    }

    for (const drop of drops) {
      this.makeDropCollectable(drop);
    }
  }

  clearActiveDrops(): void {
    for (const drop of this.activeDrops) {
      this.destroyDrop(drop);
    }

    this.activeDrops.clear();
  }

  destroy(): void {
    this.isDestroyed = true;

    for (const handle of this.animationHandles) {
      handle.stop();
    }

    this.animationHandles.clear();
    this.clearActiveDrops();

    for (const text of this.activeTexts) {
      this.destroyText(text);
    }

    this.activeTexts.clear();
  }

  private createDrops(
    originX: number,
    originY: number,
    reward: MonsterDropReward,
  ): Sprite[] {
    this.isDestroyed = false;

    const dropList = this.getDropList(reward);

    if (dropList.length === 0) {
      return [];
    }

    const drops: Sprite[] = [];
    const maxVisibleDrops = Math.min(dropList.length, 12);

    for (let i = 0; i < maxVisibleDrops; i++) {
      const dropInfo = dropList[i];
      const drop = new Sprite(dropInfo.texture);

      const angle =
        -Math.PI / 2 + ((i - (maxVisibleDrops - 1) / 2) * Math.PI) / 7;

      const distance = 52 + Math.random() * 28;

      drop.anchor.set(0.5);
      drop.x = originX;
      drop.y = originY;
      drop.alpha = 0;
      drop.width = 28;
      drop.height = 28;
      drop.scale.set(0.2);
      drop.zIndex = 35;

      drop.eventMode = 'none';
      drop.cursor = 'default';

      this.dropStates.set(drop, {
        type: dropInfo.type,
        targetX: originX + Math.cos(angle) * distance,
        targetY: originY + Math.sin(angle) * distance + 54,
        delay: i * 45,
        baseScaleX: drop.scale.x,
        baseScaleY: drop.scale.y,
      });

      drops.push(drop);
      this.activeDrops.add(drop);
      this.sceneContainer.addChild(drop);
    }

    return drops;
  }

  private getDropList(reward: MonsterDropReward): DropInfo[] {
    return [
      ...Array.from({ length: reward.soul ?? 0 }, () => ({
        type: 'soul' as const,
        texture: this.pixiAssetService.worldCoreAsset!['Soul'],
      })),
      ...Array.from({ length: reward.glitchedStone ?? 0 }, () => ({
        type: 'glitchedStone' as const,
        texture: this.pixiAssetService.worldCoreAsset!['Glitched_stone'],
      })),
    ].filter((drop): drop is DropInfo => !!drop.texture);
  }

  private makeDropCollectable(drop: Sprite): void {
    if (drop.destroyed) {
      return;
    }

    drop.eventMode = 'static';
    drop.cursor = 'pointer';

    const baseScaleX = drop.scale.x;
    const baseScaleY = drop.scale.y;

    drop.on('pointerover', () => {
      if (drop.destroyed) return;
      drop.scale.set(baseScaleX * 1.15, baseScaleY * 1.15);
    });

    drop.on('pointerout', () => {
      if (drop.destroyed) return;
      drop.scale.set(baseScaleX, baseScaleY);
    });

    drop.on('pointertap', () => {
      this.playCollectDropAnimation(drop);
    });
  }

  private playCollectDropAnimation(drop: Sprite): void {
    if (drop.destroyed) {
      return;
    }

    drop.eventMode = 'none';
    drop.cursor = 'default';
    drop.removeAllListeners();

    const state = this.dropStates.get(drop);

    if (!state) {
      return;
    }

    this.onDropClick(state.type);
    this.playDropGainTextAnimation(state.type, drop.x, drop.y);

    const startY = drop.y;
    const startScaleX = drop.scale.x;
    const startScaleY = drop.scale.y;

    let elapsed = 0;
    const duration = 320;

    void this.runTrackedAnimation((ticker) => {
      if (drop.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);

      drop.y = startY - easeOut * 34;
      drop.alpha = 1 - easeOut;
      drop.rotation += 0.12;
      drop.scale.set(
        startScaleX * (1 + easeOut * 0.45),
        startScaleY * (1 + easeOut * 0.45),
      );

      if (progress < 1) {
        return false;
      }

      this.activeDrops.delete(drop);
      this.destroyDrop(drop);

      return true;
    });
  }

  private playDropGainTextAnimation(
    dropType: DropType,
    x: number,
    y: number,
  ): void {
    const fill = dropType === 'soul' ? 0x62f06f : 0xb26dff;

    const gainText = new Text({
      text: '+1',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 20,
        fontWeight: '900',
        fill,
        stroke: {
          color: 0x140c07,
          width: 4,
        },
        dropShadow: {
          color: 0x000000,
          blur: 3,
          angle: Math.PI / 2,
          distance: 2,
          alpha: 0.45,
        },
      }),
    });

    gainText.anchor.set(0.5);
    gainText.x = x;
    gainText.y = y - 26;
    gainText.zIndex = 40;

    this.activeTexts.add(gainText);
    this.sceneContainer.addChild(gainText);

    let elapsed = 0;
    const duration = 520;
    const startY = gainText.y;

    void this.runTrackedAnimation((ticker) => {
      if (gainText.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);

      gainText.y = startY - easeOut * 28;
      gainText.alpha = 1 - easeOut;
      gainText.scale.set(1 + easeOut * 0.18);

      if (progress < 1) {
        return false;
      }

      this.activeTexts.delete(gainText);
      this.destroyText(gainText);

      return true;
    });
  }

  private runTrackedAnimation(
    update: Parameters<TickerAnimationRunner['start']>[0],
  ): Promise<void> {
    const handle = this.animationRunner.start(update);

    this.animationHandles.add(handle);

    void handle.promise.finally(() => {
      this.animationHandles.delete(handle);
    });

    return handle.promise;
  }

  private destroyDrop(drop: Sprite): void {
    if (drop.destroyed) {
      return;
    }

    drop.removeAllListeners();
    drop.removeFromParent();
    drop.destroy();
  }

  private destroyText(text: Text): void {
    if (text.destroyed) {
      return;
    }

    text.removeFromParent();
    text.destroy();
  }
}
