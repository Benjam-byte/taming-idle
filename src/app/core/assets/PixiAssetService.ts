import { Injectable } from '@angular/core';
import { Assets, Texture } from 'pixi.js';
import { manifest } from './manifest';

@Injectable({ providedIn: 'root' })
export class PixiAssetService {
  worldCoreAsset: Record<string, Texture> | null = null;
  spriteSheetAsset: Record<string, Texture> | null = null;
  attackAsset: Record<string, Texture> | null = null;

  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    await Assets.init({ manifest });
    this.initialized = true;
  }

  async loadWorldCore(): Promise<void> {
    this.worldCoreAsset = await Assets.loadBundle('world-core');
    this.spriteSheetAsset = await Assets.loadBundle('spritesheet');
    this.attackAsset = await Assets.loadBundle('attack');
  }

  getAttackTextures(animation: string): Texture[] {
    const textures: Texture[] = [];

    for (let frame = 1; ; frame++) {
      const texture = this.attackAsset?.[`attack_${animation}_${frame}`];

      if (!texture) {
        break;
      }

      textures.push(texture);
    }

    return textures;
  }
}
