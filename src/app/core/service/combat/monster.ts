export class Monster {
  constructor(
    public readonly life: number,
    public readonly maxLife: number,
    public readonly type: string,
    public readonly isEnchanted: boolean,
    public readonly isAlive: boolean,
  ) {}

  static create(isEnchanted: boolean, monsterLevel: number): Monster {
    const maxLife = 6 + monsterLevel * 3;

    return new Monster(maxLife, maxLife, "slime", isEnchanted, true);
  }

  getHit(damage: number): Monster {
    const nextLife = Math.max(0, this.life - damage);

    return new Monster(
      nextLife,
      this.maxLife,
      this.type,
      this.isEnchanted,
      nextLife > 0,
    );
  }
}
