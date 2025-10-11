/**
 * Represents the parameters of a 2nd-degree polynomial curve.
 * The cost required for a level n is computed as:
 *    cost(n) = a * n² + b * n + c
 */
export interface Polynomial2Curve {
    /** Quadratic coefficient — controls curvature. */
    a: number;

    /** Linear coefficient — controls slope. */
    b: number;

    /** Constant offset — starting cost. */
    c: number;
}

/**
 * Returns the polynomial (2nd-degree) curve result for a given n.
 *
 * @param {number} n - The value you want to calculate (e.g. level).
 * @param {Polynomial2Curve} curve - The polynomial curve parameters.
 * @returns {number} The resulting cost.
 *
 * @example
 * const curve = { a: 50, b: 200, c: 1000 };
 * const cost = costNextLevelPolynomial2(5, curve); // 50*25 + 200*5 + 1000 = 2350
 */
export function Polynomial2Curve(n: number, curve: Polynomial2Curve): number {
    return curve.a * n ** 2 + curve.b * n + curve.c;
}
