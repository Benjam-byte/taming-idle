export default class Monster {
  vie: number;
  type: string;
  isAlive: boolean;

  constructor(vie: number, type: string) {
    this.vie = vie;
    this.type = type;
    this.isAlive = true;
  }

  getHit(damage: number) {
    this.vie = this.vie - damage;
    if (this.vie === 0) this.isAlive = false;
  }
}
