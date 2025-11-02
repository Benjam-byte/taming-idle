import { Component, input, output } from '@angular/core';
import { MetaGodOption } from 'src/app/database/meta-god/meta-god.type';

@Component({
    selector: 'app-power-card',
    templateUrl: './power-card.component.html',
    styleUrls: ['./power-card.component.scss'],
})
export class PowerCardComponent {
    metaGodPower = input.required<MetaGodOption>();
    glitchedStone = input.required<number>();

    buy = output<void>();

    onClick() {
        this.buy.emit();
    }
}
