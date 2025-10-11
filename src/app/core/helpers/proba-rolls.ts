/**
 * Simule un jet de probabilité avec une chance de base et un bonus optionnel.
 *
 * @param baseChance - La probabilité de base exprimée en pourcentage (0 à 100).
 * @param bonus - Un bonus additionnel en pourcentage (par défaut 0).
 * @returns true si le jet réussit, false sinon.
 *
 * Exemple : rollWithBonus(30, 20) → ~50% de chances de retourner true.
 *
 * Note : la probabilité totale est plafonnée à 100%.
 */
export function roll(baseChance: number): number {
    const totalChance = Math.min(1, baseChance);
    const roll = Math.random();
    return roll < totalChance ? 1 : 0;
}

/**
 * Simule un jet de probabilité avec une chance de base et un bonus optionnel.
 *
 * @param baseChance - La probabilité de base exprimée en pourcentage (0 à 100).
 * @param bonus - Un bonus additionnel en pourcentage (par défaut 0).
 * @returns true si le jet réussit, false sinon.
 *
 * Exemple : rollWithBonus(30, 20) → ~50% de chances de retourner true.
 *
 * Note : la probabilité totale est plafonnée à 100%.
 */
export function rollWithBonus(baseChance: number, bonus: number = 0): number {
    const totalChance = Math.min(100, baseChance + bonus);
    const roll = Math.random() * 100;
    return roll < totalChance ? 1 : 0;
}

/**
 * Combine deux probabilités indépendantes pour obtenir une chance globale de succès.
 *
 * @param baseChance - La probabilité de base (0 à 1).
 * @param bonusChance - Une probabilité bonus indépendante (0 à 1).
 * @returns true si le jet réussit, false sinon.
 *
 * Exemple :
 *  - baseChance = 0.3 (30%), bonusChance = 0.2 (20%)
 *  - La chance combinée est : 1 - (1 - 0.3) * (1 - 0.2) = 0.44 (44%).
 *
 * Cette formule permet de dire :
 *   "réussir soit grâce à la chance de base, soit grâce au bonus, soit aux deux".
 */
export function rollCompoundChance(
    baseChance: number,
    bonusChance: number
): boolean {
    const combinedChance = 1 - (1 - baseChance) * (1 - bonusChance);
    const roll = Math.random();
    return roll < combinedChance;
}
