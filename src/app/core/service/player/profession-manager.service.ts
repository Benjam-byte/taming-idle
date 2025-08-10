import { Injectable } from '@angular/core';
import Profession from '../../value-object/profession';
import professionList from '../../json/professionJson.json';
@Injectable({ providedIn: 'root' })
export class ProfessionManagerService {
  readonly professionList: Profession[];

  constructor() {
    this.professionList = professionList.map(
      (profession) => new Profession(profession)
    );
  }

  getBonusList() {
    return {
      damage: this.getProfession('Guerrier').getValueA()['damage'],
      armorPen: this.getProfession('Guerrier').getValueB()['armorPen'],
      tacle: this.getProfession('Voyageur').getValueA()['tacle'],
      travelSpeed: this.getProfession('Voyageur').getValueB()['travelSpeed'],
      loot: this.getProfession('Fermier').getValueA()['loot'],
      fightSpeed: this.getProfession('Fermier').getValueB()['fightSpeed'],
    };
  }

  updateTraveller() {
    this.getProfession('Voyageur').progress(0.1);
  }

  updateGuerrier() {
    this.getProfession('Guerrier').progress(10);
  }

  updateFermier() {
    this.getProfession('Fermier').progress(1);
  }

  private getProfession(professionName: string) {
    return this.professionList.filter(
      (profession) => profession.profession === professionName
    )[0];
  }
}
