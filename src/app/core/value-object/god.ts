import { Offering } from '../models/offering.type';

export default class God {
  name: string;
  description: string;
  imagePath: string;
  offeringList: Offering[];

  constructor(
    name: string,
    descrition: string,
    imagePath: string,
    offeringList: Offering[]
  ) {
    this.name = name;
    this.description = descrition;
    this.imagePath = imagePath;
    this.offeringList = offeringList;
  }
}
