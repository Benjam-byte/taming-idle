export default class Monster {
  life: number;
  maxLife: number;
  type: string;
  isAlive: boolean;

  constructor(maxLife: number, type: string) {
    this.maxLife = maxLife;
    this.life = this.maxLife;
    this.type = type;
    this.isAlive = true;
  }

  getHit(damage: number) {
    this.life = this.life - damage;
    if (this.life === 0) this.isAlive = false;
  }
}
