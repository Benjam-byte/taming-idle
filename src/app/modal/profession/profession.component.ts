import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProfessionCardComponent } from './profession-card/profession-card.component';
import { ProfessionManagerService } from 'src/app/core/service/player/profession-manager.service';
import { CommonModule } from '@angular/common';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { ProfessionName } from 'src/app/core/enum/profession-name.enum';
import { HumanManagerService } from 'src/app/core/service/player/human-manager.service';

@Component({
    selector: 'app-profession',
    imports: [ProfessionCardComponent, CommonModule, ModalLayoutComponent],
    templateUrl: './profession.component.html',
    styleUrl: './profession.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionComponent {
    professionManager = inject(ProfessionManagerService);
    humanManager = inject(HumanManagerService);

    levelByProfession(professionName: ProfessionName) {
        return this.humanManager.human.availableProfession.find(
            (profession) => profession.name === professionName
        )?.level;
    }

    xpByProfession(professionName: ProfessionName) {
        return this.humanManager.human.availableProfession.find(
            (profession) => profession.name === professionName
        )?.xp;
    }
}
