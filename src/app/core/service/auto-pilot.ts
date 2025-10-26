import { inject, Injectable } from '@angular/core';
import { GameEngineService } from './game-engine.service';
import { sampleTime, Subscription } from 'rxjs';
import { AssignedMonsterManagerService } from './player/assigned-monster-manager.service';

@Injectable({
    providedIn: 'root',
})
export class AutoPilotService {
    gameEnginService = inject(GameEngineService);
    assignedMonsterManager = inject(AssignedMonsterManagerService);
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
                this.gameEnginService.submitEventByType('travel', {
                    direction: 'left',
                });
            });
    }

    deactivateAutoPilote() {
        this.autoPilotSub?.unsubscribe();
        this.autoPilotSub = undefined;
    }
}
