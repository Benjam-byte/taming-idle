import { MonsterProfile } from 'src/app/database/bestiary/bestiary.type';

export default class Monster {
    life: number;
    maxLife: number;
    type: string;
    isAlive: boolean;

    constructor(monsterProfile: MonsterProfile) {
        this.maxLife = 10;
        this.life = this.maxLife;
        this.type = monsterProfile.name;
        this.isAlive = true;
    }

    getHit(damage: number) {
        this.life = this.life - damage;
        if (this.life <= 0) this.isAlive = false;
    }
}
