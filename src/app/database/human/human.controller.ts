import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HumanService } from './human.service';
import { Human } from './human.type';
import { ProfessionName } from 'src/app/core/enum/profession-name.enum';

export const defaultMonsterProfessions = [
    {
        name: ProfessionName.Alchimiste,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Botaniste,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Fermier,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Guerrier,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Necromancien,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Pisteur,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Voleur,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
    {
        name: ProfessionName.Voyageur,
        level: 0,
        xp: 0,
        levelCap: 10,
    },
];

const defaultHuman = {
    travellingSpeed: 2000,
    fightingSpeed: 2000,
    lockPickingSpeed: 1000,
    gatherNormalBonus: 1,
    gatherEnchantedBonus: 0.5,
    lootNormalBonus: 1,
    lootEnchantedBonus: 0.5,
    findingPercentage: 0.05,
    relicId: '',
    damage: 1,
    damageSpecial: 1,
    defense: 1,
    defenseSpecial: 1,
    precision: 1,
    criticalChance: 1,
    availableProfession: defaultMonsterProfessions,
    statCap: {
        damage: 90,
        damageSpecial: 90,
        defense: 90,
        defenseSpecial: 90,
        precision: 90,
        criticalChance: 90,
    },
};

@Injectable({ providedIn: 'root' })
export class HumanController {
    service = inject(HumanService);

    init() {
        return this.service.create(defaultHuman);
    }

    get(): Observable<Human> {
        return this.service.get();
    }

    update(id: string, human: Partial<Omit<Human, 'id'>>): Observable<Human> {
        return this.service.update(id, human);
    }

    dropTable(): Observable<void> {
        return this.service.dropTable();
    }
}
