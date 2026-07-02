import { AttackSpeKey, BaseAttackKey } from 'src/app/config/attack';

export type Stat = {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};

export class Monster {
  constructor(
    public readonly life: number,
    public readonly shield: number,
    public readonly stat: Stat,
    public readonly type: string,
    public readonly baseAttack: BaseAttackKey,
    public readonly attackStocked: number,
    public readonly attackSpe: AttackSpeKey,
    public readonly isAlive: boolean,
  ) {}

  static create(
    stat: Stat,
    baseAttack: BaseAttackKey,
    attackSpe: AttackSpeKey,
  ): Monster {
    const maxLife = stat.hp;
    return new Monster(
      maxLife,
      0,
      stat,
      'neutre',
      baseAttack,
      0,
      attackSpe,
      true,
    );
  }

  getHit(damage: number): Monster {
    const nextLife = Math.max(0, this.life - damage);
    const nextAttackStocked = this.attackStocked + 1;

    return new Monster(
      nextLife,
      0,
      this.stat,
      'neutre',
      this.baseAttack,
      nextAttackStocked,
      this.attackSpe,
      nextLife > 0,
    );
  }

  getBuffed(buff: ??): Monster {}
}
