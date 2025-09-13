import { MonsterProfile } from 'src/app/database/bestiary/bestiary.type';

export default class Monster {
  life: number;
  maxLife: number;
  type: string;
  isAlive: boolean;
  lootPercentage: Record<string, number>;

  constructor(monsterProfile: MonsterProfile) {
    this.maxLife = monsterProfile.maxLife;
    this.life = this.maxLife;
    this.type = monsterProfile.name;
    this.isAlive = true;
    this.lootPercentage = monsterProfile.lootPercentage;
  }

  getHit(damage: number) {
    this.life = this.life - damage;
    if (this.life <= 0) this.isAlive = false;
  }
}
