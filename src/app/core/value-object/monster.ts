import { MonsterProfile } from 'src/app/database/bestiary/bestiary.type';

export default class Monster {
    life: number;
    maxLife: number;
    spriteSheet: string;
    type: string;
    isEnchanted: boolean;
    isAlive: boolean;

    constructor(
        monsterProfile: MonsterProfile,
        isEnchanted: boolean,
        monsterLevel: number
    ) {
        console.log('monster created');
        this.maxLife = 10 + monsterLevel * 3;
        this.life = this.maxLife;
        this.type = monsterProfile.name;
        this.isAlive = true;
        this.isEnchanted = isEnchanted;
        if (isEnchanted)
            this.spriteSheet = monsterProfile.image.enchantedSprite;
        else this.spriteSheet = monsterProfile.image.sprite;
    }

    getHit(damage: number) {
        console.log(damage);
        this.life = this.life - damage;
        console.log('life:', this.life);
        if (this.life <= 0) this.isAlive = false;
    }
}
