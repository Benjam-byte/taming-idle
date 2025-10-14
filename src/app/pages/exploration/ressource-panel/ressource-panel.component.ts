import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Loot } from 'src/app/database/loot/loot.type';
import { RoundToPipe } from '../../../core/pipe/roundTo.pipe';

@Component({
    selector: 'app-ressource-panel',
    imports: [RoundToPipe],
    templateUrl: './ressource-panel.component.html',
    styleUrl: './ressource-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RessourcePanelComponent {
    loot = input.required<Loot | null>();
}
