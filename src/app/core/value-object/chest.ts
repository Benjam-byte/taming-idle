import { rollCompoundChance } from '../helpers/proba-rolls';

export default class Chest {
  crochetageSuccesProbability: number;
  loot: number;
  try: number;

  constructor() {
    this.crochetageSuccesProbability = 2 / 100;
    this.loot = 5;
    this.try = 0;
  }

  getCrocheted(proba: number) {
    this.try++;
    return rollCompoundChance(this.crochetageSuccesProbability, proba);
  }
}
