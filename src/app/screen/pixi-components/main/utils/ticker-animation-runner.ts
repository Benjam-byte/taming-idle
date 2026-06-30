import { Application } from 'pixi.js';
import { PixiTick } from '../map-scene-renderer.types';

export type TickerAnimationHandle = {
  promise: Promise<void>;
  stop: () => void;
};

export class TickerAnimationRunner {
  constructor(private readonly game: Application) {}

  run(update: (ticker: PixiTick) => boolean | void): Promise<void> {
    return this.start(update).promise;
  }

  start(update: (ticker: PixiTick) => boolean | void): TickerAnimationHandle {
    let isStopped = false;
    let resolvePromise!: () => void;
    let tick!: (ticker: PixiTick) => void;

    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });

    const stop = () => {
      if (isStopped) {
        return;
      }

      isStopped = true;
      this.game.ticker.remove(tick);
      resolvePromise();
    };

    tick = (ticker: PixiTick) => {
      if (update(ticker)) {
        stop();
      }
    };

    this.game.ticker.add(tick);

    return {
      promise,
      stop,
    };
  }
}
