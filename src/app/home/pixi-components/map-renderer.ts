import {
  AnimatedSprite,
  Application,
  Container,
  Sprite,
  Texture,
  Text,
  TextStyle,
  Graphics,
} from 'pixi.js';
import { PixiAssetService } from 'src/app/core/assets/PixiAssetService';
import { AnimationQueue } from 'src/app/core/service/combat/animation-queue';
import { Tile } from 'src/app/core/service/map/tile';

type PixiTick = {
  deltaMS: number;
};

export type MonsterDropReward = {
  soul?: number;
  glitchedStone?: number;
};

export class MapRenderer {
  private readonly sceneContainer = new Container();
  private readonly animationQueue = new AnimationQueue();

  private background?: Sprite;
  private wheat?: Sprite;
  private monster?: AnimatedSprite;

  private slimeTextures?: Texture[];
  private perfInterval?: ReturnType<typeof setInterval>;
  private currentTileKey?: string;

  private isCollectingWheat = false;
  private wheatCollectTick?: (ticker: PixiTick) => void;

  private combatIntroOverlay?: Graphics;
  private combatIntroText?: Text;

  private isMonsterDying = false;
  private isPlayingCombatIntro = false;

  private readonly activeDrops = new Set<Sprite>();

  constructor(
    private readonly game: Application,
    private readonly container: Container,
    private readonly pixiAssetService: PixiAssetService,
    private readonly onResourceClick: () => void,
    private readonly onMonsterClick: () => void,
    private readonly onDropClick: (dropType: 'soul' | 'glitchedStone') => void,
  ) {}

  public get isAnimating(): boolean {
    return this.animationQueue.isPlaying;
  }

  init(): void {
    this.sceneContainer.label = 'mapSceneContainer';
    this.sceneContainer.sortableChildren = true;

    this.container.addChild(this.sceneContainer);

    this.loadBackground();
    this.startPerfLogs();
  }

  render(tile: Tile): void {
    const nextTileCoordinateKey = `${tile.coordinate.x}:${tile.coordinate.y}`;
    const currentTileCoordinateKey = this.currentTileKey
      ?.split(':')
      .slice(0, 2)
      .join(':');

    if (
      currentTileCoordinateKey &&
      currentTileCoordinateKey !== nextTileCoordinateKey
    ) {
      this.clearActiveDrops();
    }

    const tileKey = `${tile.coordinate.x}:${tile.coordinate.y}:${tile.hasMonster}:${tile.hasResource}`;

    if (tileKey === this.currentTileKey) {
      return;
    }

    this.currentTileKey = tileKey;

    this.updateBackgroundTexture(tile);
    this.updateMonsterTexture(tile);
    this.updateWheatTexture(tile);
  }

  destroy(): void {
    if (this.perfInterval) {
      clearInterval(this.perfInterval);
      this.perfInterval = undefined;
    }

    if (this.wheatCollectTick) {
      this.game.ticker.remove(this.wheatCollectTick);
      this.wheatCollectTick = undefined;
    }

    this.clearActiveDrops();

    this.sceneContainer.removeChildren().forEach((child) => {
      child.destroy();
    });

    if (this.sceneContainer.parent) {
      this.sceneContainer.parent.removeChild(this.sceneContainer);
    }

    this.sceneContainer.destroy();

    this.background = undefined;
    this.wheat = undefined;
    this.monster = undefined;
    this.combatIntroOverlay = undefined;
    this.combatIntroText = undefined;
  }

  public playMonsterDamageAnimation(damage: number): Promise<void> {
    return this.animationQueue.enqueue(async () => {
      if (!this.monster || this.monster.destroyed) {
        return;
      }

      const monster = this.monster;

      await Promise.all([
        this.playDamageTextAnimation(damage, monster.x, monster.y - 150),
        this.playMonsterHitEffect(monster),
      ]);
    });
  }

  public playMonsterAttackAnimation(damage: number): Promise<void> {
    return this.animationQueue.enqueue(async () => {
      if (!this.monster || this.monster.destroyed) {
        return;
      }

      await this.playMonsterAttackEffect(this.monster, damage);
    });
  }

  public playCombatIntroAnimation(): Promise<void> {
    return this.animationQueue.enqueue(() => {
      return new Promise<void>((resolve) => {
        if (this.isPlayingCombatIntro) {
          resolve();
          return;
        }

        this.isPlayingCombatIntro = true;

        const startSceneScaleX = this.sceneContainer.scale.x;
        const startSceneScaleY = this.sceneContainer.scale.y;
        const startSceneX = this.sceneContainer.x;
        const startSceneY = this.sceneContainer.y;

        const monsterStartScaleX = this.monster?.scale.x ?? 1;
        const monsterStartScaleY = this.monster?.scale.y ?? 1;

        const overlay = new Graphics();
        overlay.rect(0, 0, this.game.screen.width, this.game.screen.height);
        overlay.fill({ color: 0x000000, alpha: 0 });
        overlay.eventMode = 'none';
        overlay.zIndex = 20;

        const combatText = new Text({
          text: 'COMBAT !',
          style: new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: '900',
            fill: 0xfff3d0,
            stroke: {
              color: 0x140c07,
              width: 7,
            },
            dropShadow: {
              color: 0x000000,
              blur: 4,
              angle: Math.PI / 2,
              distance: 4,
              alpha: 0.55,
            },
          }),
        });

        combatText.anchor.set(0.5);
        combatText.x = this.game.screen.width / 2;
        combatText.y = this.game.screen.height / 2 - 170;
        combatText.alpha = 0;
        combatText.scale.set(0.65);
        combatText.zIndex = 21;

        this.sceneContainer.addChild(overlay);
        this.sceneContainer.addChild(combatText);

        this.combatIntroOverlay = overlay;
        this.combatIntroText = combatText;

        if (this.monster && !this.monster.destroyed) {
          this.monster.alpha = 0;
          this.monster.scale.set(
            monsterStartScaleX * 0.72,
            monsterStartScaleY * 0.72,
          );
          this.monster.zIndex = 22;
        }

        let elapsed = 0;
        const duration = 820;

        const tick = (ticker: PixiTick) => {
          elapsed += ticker.deltaMS;

          const progress = Math.min(elapsed / duration, 1);
          const zoomProgress = Math.sin(progress * Math.PI);
          const overlayAlpha = Math.sin(progress * Math.PI) * 0.42;

          this.sceneContainer.scale.set(
            startSceneScaleX * (1 + zoomProgress * 0.045),
            startSceneScaleY * (1 + zoomProgress * 0.045),
          );

          this.sceneContainer.x =
            startSceneX - (this.game.screen.width * zoomProgress * 0.045) / 2;

          this.sceneContainer.y =
            startSceneY - (this.game.screen.height * zoomProgress * 0.045) / 2;

          overlay.clear();
          overlay.rect(0, 0, this.game.screen.width, this.game.screen.height);
          overlay.fill({
            color: 0x000000,
            alpha: overlayAlpha,
          });

          if (progress < 0.35) {
            const localProgress = progress / 0.35;
            const easeOut = 1 - Math.pow(1 - localProgress, 3);

            combatText.alpha = easeOut;
            combatText.scale.set(0.65 + easeOut * 0.45);
          } else if (progress < 0.7) {
            const localProgress = (progress - 0.35) / 0.35;
            const pulse = Math.sin(localProgress * Math.PI);
            const pop = pulse * 0.12;

            combatText.alpha = 1;
            combatText.scale.set(1.1 + pulse * 0.08);

            if (this.monster && !this.monster.destroyed) {
              this.monster.alpha = localProgress;
              this.monster.scale.set(
                monsterStartScaleX * (0.72 + localProgress * 0.28 + pop),
                monsterStartScaleY * (0.72 + localProgress * 0.28 + pop),
              );
            }
          } else {
            const localProgress = (progress - 0.7) / 0.3;
            const easeOut = 1 - Math.pow(1 - localProgress, 3);

            combatText.alpha = 1 - easeOut;
            combatText.y = this.game.screen.height / 2 - 170 - easeOut * 34;

            if (this.monster && !this.monster.destroyed) {
              this.monster.alpha = 1;
              this.monster.scale.set(monsterStartScaleX, monsterStartScaleY);
            }
          }

          if (progress >= 1) {
            this.game.ticker.remove(tick);

            this.sceneContainer.scale.set(startSceneScaleX, startSceneScaleY);
            this.sceneContainer.x = startSceneX;
            this.sceneContainer.y = startSceneY;

            if (this.monster && !this.monster.destroyed) {
              this.monster.alpha = 1;
              this.monster.scale.set(monsterStartScaleX, monsterStartScaleY);
            }

            if (!overlay.destroyed) {
              overlay.destroy();
            }

            if (!combatText.destroyed) {
              combatText.destroy();
            }

            this.combatIntroOverlay = undefined;
            this.combatIntroText = undefined;
            this.isPlayingCombatIntro = false;

            resolve();
          }
        };

        this.game.ticker.add(tick);
      });
    });
  }

  public playMonsterDeathAnimation(
    reward: MonsterDropReward = {},
    onComplete?: () => void,
  ): Promise<void> {
    return this.animationQueue.enqueue(async () => {
      if (this.isMonsterDying) {
        return;
      }

      if (!this.monster || this.monster.destroyed) {
        onComplete?.();
        return;
      }

      this.isMonsterDying = true;

      const monster = this.monster;
      this.monster = undefined;

      monster.eventMode = 'none';
      monster.cursor = 'default';
      monster.removeAllListeners();

      const dropOrigin = {
        x: monster.x,
        y: monster.y,
      };

      await this.playMonsterDeathEffect(monster);
      await this.playMonsterDropAnimation(dropOrigin.x, dropOrigin.y, reward);

      this.isMonsterDying = false;
      onComplete?.();
    });
  }

  private startPerfLogs(): void {
    this.perfInterval = setInterval(() => {
      const mem = (performance as any).memory;

      console.log('FPS approx:', this.game.ticker.FPS);
      console.log('World children:', this.container.children.length);
      console.log('Map scene children:', this.sceneContainer.children.length);

      if (mem) {
        console.log('Heap:', Math.round(mem.usedJSHeapSize / 256 / 256), 'MB');
      }
    }, 2000);
  }

  private loadBackground(): void {
    const texture = this.getTextureForTile();

    this.background = new Sprite(texture);
    this.background.width = this.game.screen.width;
    this.background.height = this.game.screen.height;
    this.background.zIndex = 0;

    this.sceneContainer.addChild(this.background);
  }

  private updateBackgroundTexture(tile: Tile): void {
    if (!this.background) {
      return;
    }

    this.background.texture = this.getTextureForTile(tile);
  }

  private updateMonsterTexture(tile: Tile): void {
    if (this.isMonsterDying) {
      return;
    }

    if (this.monster) {
      this.monster.removeAllListeners();
      this.sceneContainer.removeChild(this.monster);
      this.monster.destroy();
      this.monster = undefined;
    }

    if (!tile.hasMonster) {
      return;
    }

    const textures = this.getSlimeTextures();

    if (textures.length === 0) {
      return;
    }

    const monster = new AnimatedSprite(textures);

    monster.animationSpeed = 0.2;
    monster.anchor.set(0.5);
    monster.width = 400;
    monster.height = 400;
    monster.x = this.game.screen.width / 2;
    monster.y = this.game.screen.height / 2;
    monster.zIndex = 10;

    monster.eventMode = 'static';
    monster.cursor = 'pointer';

    monster.on('pointertap', () => {
      if (this.isAnimating || this.isMonsterDying) {
        return;
      }

      this.onMonsterClick();
    });

    monster.play();

    this.monster = monster;
    this.sceneContainer.addChild(monster);
  }

  private updateWheatTexture(tile: Tile): void {
    if (this.isCollectingWheat) {
      return;
    }

    if (this.wheat) {
      this.wheat.removeAllListeners();
      this.sceneContainer.removeChild(this.wheat);
      this.wheat.destroy();
      this.wheat = undefined;
    }

    if (!tile.hasResource) {
      return;
    }

    const texture = this.pixiAssetService.worldCoreAsset!['wheat'];
    const wheat = new Sprite(texture);

    wheat.anchor.set(0.5);
    wheat.setSize(80, 80);
    wheat.x = this.game.screen.width / 2;
    wheat.y = 500;
    wheat.zIndex = 5;

    wheat.eventMode = 'static';
    wheat.cursor = 'pointer';

    wheat.on('pointertap', () => {
      if (this.isCollectingWheat || this.isAnimating) {
        return;
      }

      this.playCollectWheatAnimation(wheat);
    });

    this.wheat = wheat;
    this.sceneContainer.addChild(wheat);
  }

  private getTextureForTile(tile?: Tile): Texture {
    if (tile) {
      return this.pixiAssetService.worldCoreAsset![
        `plaine${this.getTileVariant(tile)}`
      ];
    }

    return this.pixiAssetService.worldCoreAsset!['plaine1'];
  }

  private getTileVariant(tile: Tile): number {
    const seed = Math.abs(tile.coordinate.x * 31 + tile.coordinate.y * 17);
    return (seed % 5) + 1;
  }

  private getSlimeTextures(): Texture[] {
    if (this.slimeTextures) {
      return this.slimeTextures;
    }

    const frameCount = 10;

    this.slimeTextures = [];

    for (let i = 0; i < frameCount; i++) {
      const texture = this.pixiAssetService.spriteSheetAsset?.[`slime_${i}`];

      if (texture) {
        this.slimeTextures.push(texture);
      }
    }

    return this.slimeTextures;
  }

  private playCollectWheatAnimation(wheat: Sprite): void {
    this.isCollectingWheat = true;

    wheat.eventMode = 'none';
    wheat.cursor = 'default';
    wheat.removeAllListeners();

    const startX = wheat.x;
    const startY = wheat.y;
    const startScaleX = wheat.scale.x;
    const startScaleY = wheat.scale.y;

    const gainText = new Text({
      text: '+1',
      style: new TextStyle({
        fontFamily: 'Arial',
        fontSize: 22,
        fontWeight: '900',
        fill: 0xfff3d0,
        stroke: {
          color: 0x140c07,
          width: 4,
        },
      }),
    });

    gainText.anchor.set(0.5);
    gainText.x = wheat.x;
    gainText.y = wheat.y - 42;
    gainText.zIndex = 30;

    this.sceneContainer.addChild(gainText);

    let elapsed = 0;
    const duration = 520;

    const tick = (ticker: PixiTick) => {
      if (wheat.destroyed || gainText.destroyed) {
        this.game.ticker.remove(tick);
        this.wheatCollectTick = undefined;
        this.isCollectingWheat = false;
        return;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const shake = Math.sin(progress * Math.PI * 4) * (1 - progress) * 3;
      const floatY = Math.sin(progress * Math.PI) * 8;
      const scaleMultiplier = 1 + easeOut * 0.08;

      wheat.x = startX + shake;
      wheat.y = startY - floatY;
      wheat.rotation = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.05;
      wheat.alpha = 1 - easeOut;

      wheat.scale.set(
        startScaleX * scaleMultiplier,
        startScaleY * scaleMultiplier,
      );

      gainText.y = startY - 42 - easeOut * 28;
      gainText.alpha = 1 - easeOut;
      gainText.scale.set(1 + easeOut * 0.12);

      if (progress >= 1) {
        this.game.ticker.remove(tick);
        this.wheatCollectTick = undefined;

        gainText.destroy();

        if (!wheat.destroyed) {
          wheat.destroy();
        }

        this.wheat = undefined;
        this.isCollectingWheat = false;

        this.onResourceClick();
      }
    };

    this.wheatCollectTick = tick;
    this.game.ticker.add(tick);
  }

  private playDamageTextAnimation(
    damage: number,
    x: number,
    y: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const damageText = new Text({
        text: `-${damage}`,
        style: new TextStyle({
          fontFamily: 'Arial',
          fontSize: 34,
          fontWeight: '900',
          fill: 0xff3b30,
          stroke: {
            color: 0x140c07,
            width: 5,
          },
          dropShadow: {
            color: 0x000000,
            blur: 3,
            angle: Math.PI / 2,
            distance: 3,
            alpha: 0.45,
          },
        }),
      });

      damageText.anchor.set(0.5);
      damageText.x = x + (Math.random() * 40 - 20);
      damageText.y = y;
      damageText.zIndex = 30;

      this.sceneContainer.addChild(damageText);

      let elapsed = 0;
      const duration = 620;

      const startY = damageText.y;
      const startX = damageText.x;

      const tick = (ticker: PixiTick) => {
        if (damageText.destroyed) {
          this.game.ticker.remove(tick);
          resolve();
          return;
        }

        elapsed += ticker.deltaMS;

        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const shake = Math.sin(progress * Math.PI * 8) * (1 - progress) * 4;

        damageText.x = startX + shake;
        damageText.y = startY - easeOut * 70;
        damageText.alpha = 1 - easeOut;
        damageText.scale.set(1 + easeOut * 0.35);

        if (progress >= 1) {
          this.game.ticker.remove(tick);

          if (!damageText.destroyed) {
            damageText.destroy();
          }

          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private playMonsterHitEffect(monster: AnimatedSprite): Promise<void> {
    return new Promise<void>((resolve) => {
      const startX = monster.x;
      const startTint = monster.tint;
      const startAlpha = monster.alpha;
      const startScaleX = monster.scale.x;
      const startScaleY = monster.scale.y;

      let elapsed = 0;
      const duration = 220;

      monster.tint = 0xff4b4b;

      const tick = (ticker: PixiTick) => {
        if (monster.destroyed) {
          this.game.ticker.remove(tick);
          resolve();
          return;
        }

        elapsed += ticker.deltaMS;

        const progress = Math.min(elapsed / duration, 1);
        const intensity = 1 - progress;

        const shake = Math.sin(progress * Math.PI * 10) * intensity * 8;
        const squash = Math.sin(progress * Math.PI) * 0.08;

        monster.x = startX + shake;
        monster.alpha =
          startAlpha * (0.72 + Math.sin(progress * Math.PI * 8) * 0.14);

        monster.scale.set(
          startScaleX * (1 + squash),
          startScaleY * (1 - squash),
        );

        if (progress >= 1) {
          this.game.ticker.remove(tick);

          if (!monster.destroyed) {
            monster.x = startX;
            monster.tint = startTint;
            monster.alpha = startAlpha;
            monster.scale.set(startScaleX, startScaleY);
          }

          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private playMonsterAttackEffect(
    monster: AnimatedSprite,
    damage: number,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const startX = monster.x;
      const startY = monster.y;
      const startScaleX = monster.scale.x;
      const startScaleY = monster.scale.y;

      let elapsed = 0;
      let hasImpacted = false;

      const duration = 520;

      const tick = (ticker: PixiTick) => {
        if (monster.destroyed) {
          this.game.ticker.remove(tick);
          resolve();
          return;
        }

        elapsed += ticker.deltaMS;

        const progress = Math.min(elapsed / duration, 1);

        if (progress < 0.25) {
          const localProgress = progress / 0.25;
          const easeOut = 1 - Math.pow(1 - localProgress, 3);

          monster.y = startY - easeOut * 22;
          monster.scale.set(
            startScaleX * (1 - easeOut * 0.04),
            startScaleY * (1 + easeOut * 0.04),
          );
        } else if (progress < 0.55) {
          const localProgress = (progress - 0.25) / 0.3;
          const easeOut = 1 - Math.pow(1 - localProgress, 3);

          monster.y = startY - 22 + easeOut * 96;
          monster.scale.set(
            startScaleX * (1 + easeOut * 0.14),
            startScaleY * (1 - easeOut * 0.08),
          );

          if (localProgress > 0.75 && !hasImpacted) {
            hasImpacted = true;
            this.playSceneImpactShake();
            this.playPlayerDamageTextAnimation(damage);
          }
        } else {
          const localProgress = (progress - 0.55) / 0.45;
          const easeOut = 1 - Math.pow(1 - localProgress, 3);

          const shake =
            Math.sin(localProgress * Math.PI * 6) * (1 - localProgress) * 5;

          monster.x = startX + shake;
          monster.y = startY + 74 * (1 - easeOut);
          monster.scale.set(
            startScaleX * (1 + (1 - easeOut) * 0.14),
            startScaleY * (1 - (1 - easeOut) * 0.08),
          );
        }

        if (progress >= 1) {
          this.game.ticker.remove(tick);

          if (!monster.destroyed) {
            monster.x = startX;
            monster.y = startY;
            monster.scale.set(startScaleX, startScaleY);
          }

          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private playPlayerDamageTextAnimation(damage: number): Promise<void> {
    return new Promise<void>((resolve) => {
      const damageText = new Text({
        text: `-${damage}`,
        style: new TextStyle({
          fontFamily: 'Arial',
          fontSize: 30,
          fontWeight: '900',
          fill: 0xff3b30,
          stroke: {
            color: 0x140c07,
            width: 5,
          },
        }),
      });

      damageText.anchor.set(0.5);
      damageText.x = this.game.screen.width / 2;
      damageText.y = this.game.screen.height - 150;
      damageText.zIndex = 30;

      this.sceneContainer.addChild(damageText);

      let elapsed = 0;
      const duration = 700;

      const startY = damageText.y;

      const tick = (ticker: PixiTick) => {
        if (damageText.destroyed) {
          this.game.ticker.remove(tick);
          resolve();
          return;
        }

        elapsed += ticker.deltaMS;

        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        damageText.y = startY - easeOut * 46;
        damageText.alpha = 1 - easeOut;
        damageText.scale.set(1 + easeOut * 0.22);

        if (progress >= 1) {
          this.game.ticker.remove(tick);

          if (!damageText.destroyed) {
            damageText.destroy();
          }

          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private playSceneImpactShake(): Promise<void> {
    return new Promise<void>((resolve) => {
      const startX = this.sceneContainer.x;
      const startY = this.sceneContainer.y;

      let elapsed = 0;
      const duration = 180;

      const tick = (ticker: PixiTick) => {
        elapsed += ticker.deltaMS;

        const progress = Math.min(elapsed / duration, 1);
        const intensity = 1 - progress;

        this.sceneContainer.x =
          startX + Math.sin(progress * Math.PI * 12) * intensity * 6;

        this.sceneContainer.y =
          startY + Math.cos(progress * Math.PI * 10) * intensity * 4;

        if (progress >= 1) {
          this.game.ticker.remove(tick);
          this.sceneContainer.x = startX;
          this.sceneContainer.y = startY;
          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private playMonsterDeathEffect(monster: AnimatedSprite): Promise<void> {
    return new Promise<void>((resolve) => {
      const startX = monster.x;
      const startY = monster.y;
      const startScaleX = monster.scale.x;
      const startScaleY = monster.scale.y;
      const startRotation = monster.rotation;
      const startTint = monster.tint;

      let elapsed = 0;
      const duration = 720;

      const deathText = new Text({
        text: 'KO',
        style: new TextStyle({
          fontFamily: 'Arial',
          fontSize: 46,
          fontWeight: '900',
          fill: 0xfff3d0,
          stroke: {
            color: 0x140c07,
            width: 7,
          },
          dropShadow: {
            color: 0x000000,
            blur: 4,
            angle: Math.PI / 2,
            distance: 4,
            alpha: 0.5,
          },
        }),
      });

      deathText.anchor.set(0.5);
      deathText.x = startX;
      deathText.y = startY - 170;
      deathText.alpha = 0;
      deathText.scale.set(0.75);
      deathText.zIndex = 30;

      this.sceneContainer.addChild(deathText);

      const tick = (ticker: PixiTick) => {
        if (monster.destroyed || deathText.destroyed) {
          this.game.ticker.remove(tick);
          resolve();
          return;
        }

        elapsed += ticker.deltaMS;

        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const easeIn = progress * progress;

        const squash = Math.sin(progress * Math.PI) * 0.22;
        const shake = Math.sin(progress * Math.PI * 12) * (1 - progress) * 10;

        monster.x = startX + shake;
        monster.y = startY + easeIn * 55;

        monster.rotation =
          startRotation +
          Math.sin(progress * Math.PI * 5) * (1 - progress) * 0.08;

        monster.scale.set(
          startScaleX * Math.max(0.01, 1 + squash - easeOut * 0.85),
          startScaleY * Math.max(0.01, 1 - squash - easeOut * 0.85),
        );

        monster.alpha = 1 - easeOut;
        monster.tint = progress < 0.28 ? 0xffffff : startTint;

        deathText.alpha = progress < 0.25 ? progress / 0.25 : 1 - easeOut;
        deathText.y = startY - 170 - easeOut * 36;
        deathText.scale.set(0.75 + Math.sin(progress * Math.PI) * 0.35);

        if (progress >= 1) {
          this.game.ticker.remove(tick);

          if (!deathText.destroyed) {
            deathText.destroy();
          }

          if (!monster.destroyed) {
            this.sceneContainer.removeChild(monster);
            monster.destroy();
          }

          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private playMonsterDropAnimation(
    originX: number,
    originY: number,
    reward: MonsterDropReward,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const drops: Sprite[] = [];

      const dropList = [
        ...Array.from({ length: reward.soul ?? 0 }, () => ({
          type: 'soul',
          texture: this.pixiAssetService.worldCoreAsset!['Soul'],
        })),
        ...Array.from({ length: reward.glitchedStone ?? 0 }, () => ({
          type: 'glitchedStone',
          texture: this.pixiAssetService.worldCoreAsset!['Glitched_stone'],
        })),
      ].filter((drop) => !!drop.texture);

      if (dropList.length === 0) {
        resolve();
        return;
      }

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

        (drop as any).__dropType = dropInfo.type;
        (drop as any).__targetX = originX + Math.cos(angle) * distance;
        (drop as any).__targetY = originY + Math.sin(angle) * distance + 54;
        (drop as any).__delay = i * 45;
        (drop as any).__baseScaleX = drop.scale.x;
        (drop as any).__baseScaleY = drop.scale.y;

        drops.push(drop);
        this.activeDrops.add(drop);
        this.sceneContainer.addChild(drop);
      }

      let elapsed = 0;
      const duration = 620;

      const tick = (ticker: PixiTick) => {
        elapsed += ticker.deltaMS;

        let allDone = true;

        for (const drop of drops) {
          if (drop.destroyed) {
            continue;
          }

          const delay = (drop as any).__delay as number;
          const localElapsed = elapsed - delay;

          if (localElapsed < 0) {
            allDone = false;
            continue;
          }

          const progress = Math.min(localElapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const arc = Math.sin(progress * Math.PI) * 32;

          const targetX = (drop as any).__targetX as number;
          const targetY = (drop as any).__targetY as number;
          const baseScaleX = (drop as any).__baseScaleX as number;
          const baseScaleY = (drop as any).__baseScaleY as number;

          drop.alpha = progress < 0.15 ? progress / 0.15 : 1;
          drop.x = originX + (targetX - originX) * easeOut;
          drop.y = originY + (targetY - originY) * easeOut - arc;
          drop.rotation += 0.045;

          const pop = Math.sin(progress * Math.PI) * 0.18;
          drop.scale.set(baseScaleX * (1 + pop), baseScaleY * (1 + pop));

          if (progress < 1) {
            allDone = false;
          }
        }

        if (allDone) {
          this.game.ticker.remove(tick);

          for (const drop of drops) {
            this.makeDropCollectable(drop);
          }

          resolve();
        }
      };

      this.game.ticker.add(tick);
    });
  }

  private makeDropCollectable(drop: Sprite): void {
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

    const dropType = (drop as any).__dropType as 'soul' | 'glitchedStone';

    this.onDropClick(dropType);
    this.playDropGainTextAnimation(dropType, drop.x, drop.y);

    const startY = drop.y;
    const startScaleX = drop.scale.x;
    const startScaleY = drop.scale.y;

    let elapsed = 0;
    const duration = 320;

    const tick = (ticker: PixiTick) => {
      if (drop.destroyed) {
        this.game.ticker.remove(tick);
        return;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      drop.y = startY - easeOut * 34;
      drop.alpha = 1 - easeOut;
      drop.rotation += 0.12;
      drop.scale.set(
        startScaleX * (1 + easeOut * 0.45),
        startScaleY * (1 + easeOut * 0.45),
      );

      if (progress >= 1) {
        this.game.ticker.remove(tick);

        this.activeDrops.delete(drop);

        if (!drop.destroyed) {
          drop.destroy();
        }
      }
    };

    this.game.ticker.add(tick);
  }

  private playDropGainTextAnimation(
    dropType: 'soul' | 'glitchedStone',
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

    this.sceneContainer.addChild(gainText);

    let elapsed = 0;
    const duration = 520;

    const startY = gainText.y;

    const tick = (ticker: PixiTick) => {
      if (gainText.destroyed) {
        this.game.ticker.remove(tick);
        return;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      gainText.y = startY - easeOut * 28;
      gainText.alpha = 1 - easeOut;
      gainText.scale.set(1 + easeOut * 0.18);

      if (progress >= 1) {
        this.game.ticker.remove(tick);

        if (!gainText.destroyed) {
          gainText.destroy();
        }
      }
    };

    this.game.ticker.add(tick);
  }

  private clearActiveDrops(): void {
    for (const drop of this.activeDrops) {
      if (!drop.destroyed) {
        drop.removeAllListeners();
        this.sceneContainer.removeChild(drop);
        drop.destroy();
      }
    }

    this.activeDrops.clear();
  }
}
