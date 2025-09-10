// linéaire sur la base
export function rateLinear(baseRate: number, percentage: number): number {
  return baseRate * (1 + percentage);
}

// exponentiel (optionnel)
export function rateExponential(
  baseRate: number,
  percentPerLevel: number,
  level: number
): number {
  return baseRate * Math.pow(1 + percentPerLevel, level);
}
