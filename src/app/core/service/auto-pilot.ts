import { inject, Injectable } from '@angular/core';
import { GameEngineService } from './game-engine.service';
import { sampleTime, Subscription } from 'rxjs';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';
import { MapManagerService } from './location/map.service';
import { GatherFacade } from 'src/app/pages/exploration/empty-area/gather-facade';

@Injectable({
    providedIn: 'root',
})
export class AutoPilotService {
    gameEnginService = inject(GameEngineService);
    mapManager = inject(MapManagerService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
    gatherFacade = inject(GatherFacade);
    private autoPilotSub?: Subscription;
    isActive = true;

    constructor() {
        if (this.assignedMonsterManager.assignedMonster.name === 'Terra larva')
            this.isActive = false;
        this.toggleAutoPilote(!this.isActive);
    }

    toggleAutoPilote(value: boolean) {
        this.isActive = value;
        this.isActive ? this.deactivateAutoPilote() : this.activateAutoPilote();
    }

    activateAutoPilote() {
        if (this.isActive) return;
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
                this.gameEnginService.submitEventByType('flee');
                break;
            case 'tresor':
                this.gameEnginService.submitEventByType('skip');
                break;
        }
    }
}
