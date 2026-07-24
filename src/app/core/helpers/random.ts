export function pickWeightedChoice<T>(
  itemList: readonly T[],
  weightList: number[],
): T {
  if (itemList.length !== weightList.length) {
    throw new Error("Il doit y avoir autant de poids que d'elements");
  }

  const totalWeight = weightList.reduce((sum, weight) => sum + weight);
  const rand = Math.random();

  let threshold = 0;
  for (let index = 0; index < weightList.length; index++) {
    const weight = weightList[index];
    threshold += weight / totalWeight;
    if (rand < threshold) {
      return itemList[index];
    }
  }

  return itemList[weightList.length - 1];
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

export function generateIntNormal(mu: number, sigma: number) {
  const rand = Math.random();
  return Math.round(Math.exp((rand - mu) / sigma));
}

export function getSigmaForWindow(n: number): number {
  return 0.608 * (n + 0.5);
}

export function generateInWindow(mu: number, n: number) {
  if (n < 0) {
    throw new Error('Cannot generate random number with negative window');
  }

  const sigma = getSigmaForWindow(n);
  const value = generateIntNormal(mu, sigma);

  let lowerBound = mu - n;
  let upperBound = mu + n;

  return clamp(value, lowerBound, upperBound);
}
