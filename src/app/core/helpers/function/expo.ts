/**
 * Represents the parameters of an exponential curve.
 * The cost required n is computed as:
 *    cost(n) = a * b^n + c
 */
export interface ExponentialCurve {
    /** Scale coefficient — controls the overall magnitude. */
    a: number;

    /** Growth rate — base of the exponential (e.g., 1.05 = +5% per level). */
    b: number;

    /** Constant offset — starting cost added after scaling. */
    c: number;
}

/**
 * Returns the exponential curve result for a given n.
 *
 * @param {number} n - The current value.
 * @param {ExponentialCurve} curve - The exponential curve parameters.
 * @returns {number} The cost.
 *
 * @example
 * const curve = { a: 100, b: 1.1, c: 0 };
 * const cost = costNextLevelExponential(5, curve); // ≈ 161.05
 */
export function ExponentialCurve(n: number, curve: ExponentialCurve): number {
    const { a, b, c } = curve;
    return a * Math.pow(b, n) + c;
}
