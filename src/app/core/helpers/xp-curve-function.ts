export type CurveMetaData = {
    A: number;
    C: number;
    P: number;
};

/** XP nécessaire pour passer de n à n+1 (valeur flottante) */
export function xpToNextLevelFloat(n: number, metaData: CurveMetaData): number {
    const { A, C, P } = metaData;
    return A * Math.pow(n + C, P);
}

/** Somme des XP entre n1 et n2 inclus (flottant) */
export function xpSumFloat(
    n1: number,
    n2: number,
    metaData: CurveMetaData
): number {
    let s = 0;
    for (let n = n1; n <= n2; n++) s += xpToNextLevelFloat(n, metaData);
    return s;
}
