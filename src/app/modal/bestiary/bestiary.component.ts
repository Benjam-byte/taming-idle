import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BestiaryManagerService } from 'src/app/core/service/monster/bestiary-manager.service';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

@Component({
    selector: 'app-bestiary',
    imports: [ModalLayoutComponent],
    templateUrl: './bestiary.component.html',
    styleUrl: './bestiary.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestiaryComponent {
    bestiaryManagerService = inject(BestiaryManagerService);

    monsterList = toSignal(this.bestiaryManagerService.bestiaryList$);
}
