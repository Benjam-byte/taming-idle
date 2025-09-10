export type Num = number;

// Géométrique simple
export function costGeom(n: number, c0: Num, r: Num): Num {
  return c0 * Math.pow(r, Math.max(0, n - 1));
}

// Géométrique simple entier
export function costGeomInt(n: number, c0: Num, r: Num): Num {
  return Math.round(costGeom(n, c0, r));
}

// Polynomiale
export function costPoly(n: number, a: Num, k: Num, b: Num = 0): Num {
  return a * Math.pow(n, k) + b;
}

// Hybride (3 paliers)
export function costHybrid(
  n: number,
  c0: Num,
  r1: Num,
  r2: Num,
  r3: Num,
  N1: number,
  N2: number
): Num {
  const part1 = Math.pow(r1, Math.min(n, N1));
  const part2 = Math.pow(r2, Math.max(0, Math.min(n - N1, N2 - N1)));
  const part3 = Math.pow(r3, Math.max(0, n - N2));
  return c0 * part1 * part2 * part3;
}
