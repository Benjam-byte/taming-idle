// linéaire sur la base
export function rateLinear(baseRate: number, percentage: number): number {
    return baseRate * (1 + percentage);
}
