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

export class CombatAnimationRenderer {
  private readonly animationHandles = new Set<TickerAnimationHandle>();
  private readonly activeTexts = new Set<Text>();

  private combatIntroOverlay?: Graphics;
  private combatIntroText?: Text;
  private isPlayingCombatIntro = false;

  constructor(
    private readonly game: Application,
    private readonly sceneContainer: Container,
    private readonly animationRunner: TickerAnimationRunner,
  ) { }

  async playMonsterDamageAnimation(
    monster: AnimatedSprite | undefined,
    damage: number,
  ): Promise<void> {
    if (!monster || monster.destroyed) {
      return;
    }

    await Promise.all([
      this.playDamageTextAnimation(damage, monster.x, monster.y - 150),
      this.playMonsterHitEffect(monster),
    ]);
  }

  async playMonsterAttackAnimation(
    monster: AnimatedSprite | undefined,
    damage: number,
  ): Promise<void> {
    if (!monster || monster.destroyed) {
      return;
    }

    await this.playMonsterAttackEffect(monster, damage);
  }

  playCombatIntroAnimation(monster: AnimatedSprite | undefined): Promise<void> {
    if (this.isPlayingCombatIntro) {
      return Promise.resolve();
    }

    this.isPlayingCombatIntro = true;

    const startSceneScaleX = this.sceneContainer.scale.x;
    const startSceneScaleY = this.sceneContainer.scale.y;
    const startSceneX = this.sceneContainer.x;
    const startSceneY = this.sceneContainer.y;

    const monsterStartScaleX = monster?.scale.x ?? 1;
    const monsterStartScaleY = monster?.scale.y ?? 1;

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

    if (monster && !monster.destroyed) {
      monster.alpha = 0;
      monster.scale.set(monsterStartScaleX * 0.72, monsterStartScaleY * 0.72);
      monster.zIndex = 22;
    }

    let elapsed = 0;
    const duration = 820;

    return this.runTrackedAnimation((ticker) => {
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
        const easeOut = easeOutCubic(localProgress);

        combatText.alpha = easeOut;
        combatText.scale.set(0.65 + easeOut * 0.45);
      } else if (progress < 0.7) {
        const localProgress = (progress - 0.35) / 0.35;
        const pulse = Math.sin(localProgress * Math.PI);
        const pop = pulse * 0.12;

        combatText.alpha = 1;
        combatText.scale.set(1.1 + pulse * 0.08);

        if (monster && !monster.destroyed) {
          monster.alpha = localProgress;
          monster.scale.set(
            monsterStartScaleX * (0.72 + localProgress * 0.28 + pop),
            monsterStartScaleY * (0.72 + localProgress * 0.28 + pop),
          );
        }
      } else {
        const localProgress = (progress - 0.7) / 0.3;
        const easeOut = easeOutCubic(localProgress);

        combatText.alpha = 1 - easeOut;
        combatText.y = this.game.screen.height / 2 - 170 - easeOut * 34;

        if (monster && !monster.destroyed) {
          monster.alpha = 1;
          monster.scale.set(monsterStartScaleX, monsterStartScaleY);
        }
      }

      if (progress < 1) {
        return false;
      }

      this.sceneContainer.scale.set(startSceneScaleX, startSceneScaleY);
      this.sceneContainer.x = startSceneX;
      this.sceneContainer.y = startSceneY;

      if (monster && !monster.destroyed) {
        monster.alpha = 1;
        monster.scale.set(monsterStartScaleX, monsterStartScaleY);
      }

      this.destroyCombatIntroObjects();
      this.isPlayingCombatIntro = false;

      return true;
    });
  }

  playMonsterDeathEffect(monster: AnimatedSprite): Promise<void> {
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

    this.activeTexts.add(deathText);
    this.sceneContainer.addChild(deathText);

    return this.runTrackedAnimation((ticker) => {
      if (monster.destroyed || deathText.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);
      const easeIn = easeInQuad(progress);

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

      if (progress < 1) {
        return false;
      }

      this.activeTexts.delete(deathText);
      this.destroyText(deathText);

      if (!monster.destroyed) {
        monster.removeFromParent();
        monster.destroy();
      }

      return true;
    });
  }

  destroy(): void {
    for (const handle of this.animationHandles) {
      handle.stop();
    }

    this.animationHandles.clear();
    this.destroyCombatIntroObjects();

    for (const text of this.activeTexts) {
      this.destroyText(text);
    }

    this.activeTexts.clear();
    this.isPlayingCombatIntro = false;
  }

  private playDamageTextAnimation(
    damage: number,
    x: number,
    y: number,
  ): Promise<void> {
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

    this.activeTexts.add(damageText);
    this.sceneContainer.addChild(damageText);

    let elapsed = 0;
    const duration = 620;

    const startY = damageText.y;
    const startX = damageText.x;

    return this.runTrackedAnimation((ticker) => {
      if (damageText.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);

      const shake = Math.sin(progress * Math.PI * 8) * (1 - progress) * 4;

      damageText.x = startX + shake;
      damageText.y = startY - easeOut * 70;
      damageText.alpha = 1 - easeOut;
      damageText.scale.set(1 + easeOut * 0.35);

      if (progress < 1) {
        return false;
      }

      this.activeTexts.delete(damageText);
      this.destroyText(damageText);

      return true;
    });
  }

  private playMonsterHitEffect(monster: AnimatedSprite): Promise<void> {
    const startX = monster.x;
    const startTint = monster.tint;
    const startAlpha = monster.alpha;
    const startScaleX = monster.scale.x;
    const startScaleY = monster.scale.y;

    let elapsed = 0;
    const duration = 220;

    monster.tint = 0xff4b4b;

    return this.runTrackedAnimation((ticker) => {
      if (monster.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const intensity = 1 - progress;

      const shake = Math.sin(progress * Math.PI * 10) * intensity * 8;
      const squash = Math.sin(progress * Math.PI) * 0.08;

      monster.x = startX + shake;
      monster.alpha =
        startAlpha * (0.72 + Math.sin(progress * Math.PI * 8) * 0.14);

      monster.scale.set(startScaleX * (1 + squash), startScaleY * (1 - squash));

      if (progress < 1) {
        return false;
      }

      if (!monster.destroyed) {
        monster.x = startX;
        monster.tint = startTint;
        monster.alpha = startAlpha;
        monster.scale.set(startScaleX, startScaleY);
      }

      return true;
    });
  }

  private playMonsterAttackEffect(
    monster: AnimatedSprite,
    damage: number,
  ): Promise<void> {
    const startX = monster.x;
    const startY = monster.y;
    const startScaleX = monster.scale.x;
    const startScaleY = monster.scale.y;

    let elapsed = 0;
    let hasImpacted = false;

    const duration = 520;

    return this.runTrackedAnimation((ticker) => {
      if (monster.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);

      if (progress < 0.25) {
        const localProgress = progress / 0.25;
        const easeOut = easeOutCubic(localProgress);

        monster.y = startY - easeOut * 22;
        monster.scale.set(
          startScaleX * (1 - easeOut * 0.04),
          startScaleY * (1 + easeOut * 0.04),
        );
      } else if (progress < 0.55) {
        const localProgress = (progress - 0.25) / 0.3;
        const easeOut = easeOutCubic(localProgress);

        monster.y = startY - 22 + easeOut * 96;
        monster.scale.set(
          startScaleX * (1 + easeOut * 0.14),
          startScaleY * (1 - easeOut * 0.08),
        );

        if (localProgress > 0.75 && !hasImpacted) {
          hasImpacted = true;
          void this.playSceneImpactShake();
          void this.playPlayerDamageTextAnimation(damage);
        }
      } else {
        const localProgress = (progress - 0.55) / 0.45;
        const easeOut = easeOutCubic(localProgress);

        const shake =
          Math.sin(localProgress * Math.PI * 6) * (1 - localProgress) * 5;

        monster.x = startX + shake;
        monster.y = startY + 74 * (1 - easeOut);
        monster.scale.set(
          startScaleX * (1 + (1 - easeOut) * 0.14),
          startScaleY * (1 - (1 - easeOut) * 0.08),
        );
      }

      if (progress < 1) {
        return false;
      }

      if (!monster.destroyed) {
        monster.x = startX;
        monster.y = startY;
        monster.scale.set(startScaleX, startScaleY);
      }

      return true;
    });
  }

  private playPlayerDamageTextAnimation(damage: number): Promise<void> {
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

    this.activeTexts.add(damageText);
    this.sceneContainer.addChild(damageText);

    let elapsed = 0;
    const duration = 700;

    const startY = damageText.y;

    return this.runTrackedAnimation((ticker) => {
      if (damageText.destroyed) {
        return true;
      }

      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const easeOut = easeOutCubic(progress);

      damageText.y = startY - easeOut * 46;
      damageText.alpha = 1 - easeOut;
      damageText.scale.set(1 + easeOut * 0.22);

      if (progress < 1) {
        return false;
      }

      this.activeTexts.delete(damageText);
      this.destroyText(damageText);

      return true;
    });
  }

  private playSceneImpactShake(): Promise<void> {
    const startX = this.sceneContainer.x;
    const startY = this.sceneContainer.y;

    let elapsed = 0;
    const duration = 180;

    return this.runTrackedAnimation((ticker) => {
      elapsed += ticker.deltaMS;

      const progress = Math.min(elapsed / duration, 1);
      const intensity = 1 - progress;

      this.sceneContainer.x =
        startX + Math.sin(progress * Math.PI * 12) * intensity * 6;

      this.sceneContainer.y =
        startY + Math.cos(progress * Math.PI * 10) * intensity * 4;

      if (progress < 1) {
        return false;
      }

      this.sceneContainer.x = startX;
      this.sceneContainer.y = startY;

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

  private destroyCombatIntroObjects(): void {
    if (this.combatIntroOverlay && !this.combatIntroOverlay.destroyed) {
      this.combatIntroOverlay.destroy();
    }

    if (this.combatIntroText && !this.combatIntroText.destroyed) {
      this.combatIntroText.destroy();
    }

    this.combatIntroOverlay = undefined;
    this.combatIntroText = undefined;
  }

  private destroyText(text: Text): void {
    if (text.destroyed) {
      return;
    }

    text.removeFromParent();
    text.destroy();
  }
}
