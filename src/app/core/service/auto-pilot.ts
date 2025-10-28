import { inject, Injectable } from '@angular/core';
import { GameEngineService } from './game-engine.service';
import { sampleTime, Subscription } from 'rxjs';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';
import { MapManagerService } from './location/map.service';
import { GatherFacade } from 'src/app/pages/exploration/empty-area/gather-facade';
import { ProfessionName } from '../enum/profession-name.enum';
import { FightFacade } from 'src/app/pages/exploration/monster-area/fight-facade';

@Injectable({
    providedIn: 'root',
})
export class AutoPilotService {
    gameEnginService = inject(GameEngineService);
    mapManager = inject(MapManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    gatherFacade = inject(GatherFacade);
    fightFacade = inject(FightFacade);

    private autoPilotSub?: Subscription;
    isActive!: boolean;

    constructor() {
        if (
            this.assignedMonsterManager.assignedMonster.monsterSpecies ===
            'Terra larva'
        )
            this.toggleAutoPilote(false);
        else this.toggleAutoPilote(true);
    }

    toggleAutoPilote(value: boolean) {
        this.isActive = value;
        this.isActive ? this.activateAutoPilote() : this.deactivateAutoPilote();
    }

    activateAutoPilote() {
        this.autoPilotSub = this.gameEnginService
            .getTick$()
            .pipe(
                sampleTime(
                    this.assignedMonsterManager.assignedMonster.travellingSpeed
                )
            )
            .subscribe(() => {
                this.autoMapAction();
            });
    }

    deactivateAutoPilote() {
        this.autoPilotSub?.unsubscribe();
        this.autoPilotSub = undefined;
    }

    private autoMapAction() {
        const map = this.mapManager.map().map;
        switch (map) {
            case 'empty':
                this.gatherFacade.collectWheatFromAuto();
                this.gameEnginService.submitEventByType('travel', {
                    direction: 'left',
                });
                break;
            case 'monster':
                if (
                    this.assignedMonsterManager.assignedMonster.availableProfession
                        .map((profession) => profession.name)
                        .includes(ProfessionName.Guerrier)
                ) {
                    this.fightFacade.fightFromAuto();
                } else {
                    this.gameEnginService.submitEventByType('flee');
                }
                break;
            case 'tresor':
                if (
                    this.assignedMonsterManager.assignedMonster.availableProfession
                        .map((profession) => profession.name)
                        .includes(ProfessionName.Voleur)
                ) {
                    console.log('wtf no monster should do that');
                } else {
                    this.gameEnginService.submitEventByType('skip');
                }
                break;
        }
    }
}
