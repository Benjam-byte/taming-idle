export function pick3WeightedItem(itemList: any[]) {
    if (itemList.length !== 3) {
        throw new Error('La liste doit contenir exactement 3 éléments');
    }

    const rand = Math.random() * 100;

    if (rand < 85) return itemList[0];
    if (rand < 95) return itemList[1];
    return itemList[2];
}
