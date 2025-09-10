export function stochasticRound(x: number): number {
  const floor = Math.floor(x);
  const ceil = Math.ceil(x);
  const frac = x - floor;

  return Math.random() < frac ? ceil : floor;
}
