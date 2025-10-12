/**
 * Returns the exponential curve result for a given n.
 *
 * @param {number} n - The current value.
 * @param {number[]} tresholdList - The treshold list.
 * @returns {number} The cost.
 *
 * @example
 * const tresholdList = [1,2];
 * const cost = costNextLevelExponential(1, tresholdList); // = 2
 */
export function Treshold(n: number, tresholdList: number[]): number {
    return tresholdList[n];
}
