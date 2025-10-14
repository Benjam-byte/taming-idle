/**
 * Performs stochastic (probabilistic) rounding on a decimal number.
 *
 * The number is rounded either down (`floor`) or up (`ceil`) based on its fractional part:
 * - The larger the fractional part, the higher the probability of rounding up.
 * - Example: 5.6 has a 60% chance to round to 6 and a 40% chance to round to 5.
 *
 * @param {number} x - The number to stochastically round.
 * @returns {number} The rounded integer, either `Math.floor(x)` or `Math.ceil(x)`.
 *
 * @example
 * stochasticRound(3.2); // Returns 3 (80% of the time) or 4 (20% of the time)
 *
 * @example
 * stochasticRound(7.9); // Returns 7 (10% of the time) or 8 (90% of the time)
 */
export function stochasticRound(x: number): number {
    const floor = Math.floor(x);
    const ceil = Math.ceil(x);
    const frac = x - floor;
    const r = Math.random() < frac ? ceil : floor;
    return r;
}

/**
 * Rounds a number to a precision defined by the given factor.
 *
 * The factor determines the rounding granularity:
 * - Use `10` to round to 1 decimal place.
 * - Use `100` to round to 2 decimal places.
 * - Use `0.5` to round to the nearest 0.5, etc.
 *
 * `Number.EPSILON` is added to reduce floating-point rounding errors.
 *
 * @param {number} n - The number to round.
 * @param {number} factor - The rounding factor (e.g. 10 for 1 decimal place).
 * @returns {number} The rounded number.
 *
 * @example
 * roundTo(5.678, 10);   // Returns 5.7 (1 decimal place)
 *
 * @example
 * roundTo(5.678, 100);  // Returns 5.68 (2 decimal places)
 *
 * @example
 * roundTo(7.3, 0.5);    // Returns 7.5 (nearest half)
 */
export function roundTo(n: number, factor: number): number {
    return Math.round((n + Number.EPSILON) * factor) / factor;
}
