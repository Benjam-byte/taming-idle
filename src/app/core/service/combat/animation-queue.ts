export class AnimationQueue {
  private chain = Promise.resolve();
  private locked = false;

  enqueue(animation: () => Promise<void>): Promise<void> {
    this.chain = this.chain
      .then(() => {
        this.locked = true;
        return animation();
      })
      .finally(() => {
        this.locked = false;
      });

    return this.chain;
  }

  async wait(): Promise<void> {
    await this.chain;
  }

  get isPlaying(): boolean {
    return this.locked;
  }
}
