import { Profession } from 'src/app/database/profession/profession.type';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';

export function getStatUpdateFromMonsterLevel(monster: TamedMonster) {
    const stats = [
        'damage',
        'damageSpecial',
        'defense',
        'defenseSpecial',
        'precision',
        'criticalChance',
    ] as const;

    const statPoints = 6;
    const distribution: Record<(typeof stats)[number], number> = {
        damage: 0,
        damageSpecial: 0,
        defense: 0,
        defenseSpecial: 0,
        precision: 0,
        criticalChance: 0,
    };

    const currentStats = {
        damage: monster.damage,
        damageSpecial: monster.damageSpecial,
        defense: monster.defense,
        defenseSpecial: monster.defenseSpecial,
        precision: monster.precision,
        criticalChance: monster.criticalChance,
    };

    let pointsLeft = statPoints;
    while (pointsLeft > 0) {
        const availableStats = stats.filter(
            (stat) =>
                currentStats[stat] + distribution[stat] < monster.statCap[stat]
        );
        if (availableStats.length === 0) break;
        const randomStat =
            availableStats[Math.floor(Math.random() * availableStats.length)];

        distribution[randomStat]++;
        pointsLeft--;
    }

    return {
        damage: currentStats.damage + distribution.damage,
        damageSpecial: currentStats.damageSpecial + distribution.damageSpecial,
        defense: currentStats.defense + distribution.defense,
        defenseSpecial:
            currentStats.defenseSpecial + distribution.defenseSpecial,
        precision: currentStats.precision + distribution.precision,
        criticalChance:
            currentStats.criticalChance + distribution.criticalChance,
    };
}

export function updateStatFromProfession(
    profession: Profession,
    monster: TamedMonster
) {
    return {
        [profession.value.stat]:
            profession.value.value +
            +monster[profession.value.stat as keyof typeof monster],
    };
}
