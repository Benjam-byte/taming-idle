export function rollWithBonus(baseChance: number, bonus: number = 0): boolean {
  const totalChance = Math.min(100, baseChance + bonus);
  const roll = Math.random() * 100;
  return roll < totalChance;
}

export function rollCompoundChance(
  baseChance: number,
  bonusChance: number
): boolean {
  const combinedChance = 1 - (1 - baseChance) * (1 - bonusChance);
  const roll = Math.random();
  return roll < combinedChance;
}
