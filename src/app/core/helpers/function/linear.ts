/**
 * Represents the parameters of a linear curve.
 * The cost required for a level n is computed as:
 *    cost(n) = a * n + b
 */
export interface LinearCurve {
    /** The slope (increment per level). */
    a: number;

    /** The base offset (starting cost). */
    b: number;
}

/**
 * Returns the linear curve result for n.
 *
 * @param {number} n - The value you want to calculate.
 * @param {LinearCurve} curve - The linear curve parameters.
 * @returns {number} The result.
 *
 * @example
 * const curve = { a: 500, b: 0 };
 * const cost = costNextLevelLinear(5, curve); // 2500
 */
export function LinearCurve(n: number, curve: LinearCurve): number {
    return curve.a * n + curve.b;
}
