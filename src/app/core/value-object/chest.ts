export default class Chest {
  vie: number;
  isAlive: boolean;

  constructor(vie: number) {
    this.vie = vie;
    this.isAlive = true;
  }

  getHit(damage: number) {
    this.vie = this.vie - damage;
    if (this.vie === 0) this.isAlive = false;
  }
}
