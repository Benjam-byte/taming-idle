const lootDict: Record<string, Minerals> = {
  slime: { copper: 1 },
};

type Minerals = {
  copper: number;
};

export default class Monster {
  life: number;
  maxLife: number;
  type: string;
  isAlive: boolean;
  loot: Minerals;

  constructor(maxLife: number, type: string) {
    this.maxLife = maxLife;
    this.life = this.maxLife;
    this.type = type;
    this.isAlive = true;
    this.loot = lootDict[this.type];
  }

  getHit(damage: number) {
    this.life = this.life - damage;
    if (this.life === 0) this.isAlive = false;
  }
}
