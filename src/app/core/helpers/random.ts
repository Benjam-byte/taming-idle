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
