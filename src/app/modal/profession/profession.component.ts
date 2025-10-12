import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProfessionCardComponent } from './profession-card/profession-card.component';
import { ProfessionManagerService } from 'src/app/core/service/player/profession-manager.service';
import { CommonModule } from '@angular/common';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

@Component({
    selector: 'app-profession',
    imports: [ProfessionCardComponent, CommonModule, ModalLayoutComponent],
    templateUrl: './profession.component.html',
    styleUrl: './profession.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionComponent {
    professionManager = inject(ProfessionManagerService);
}
