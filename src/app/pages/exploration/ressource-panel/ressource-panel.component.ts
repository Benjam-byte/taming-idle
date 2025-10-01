import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Loot } from 'src/app/database/loot/loot.type';

@Component({
    selector: 'app-ressource-panel',
    imports: [],
    templateUrl: './ressource-panel.component.html',
    styleUrl: './ressource-panel.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RessourcePanelComponent {
    loot = input.required<Loot | null>();
}
