import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import {
    CombatType,
    MonsterType,
} from 'src/app/database/bestiary/bestiary.type';
import { TamedMonsterManagerService } from 'src/app/core/service/monster/tamed-monster-manager.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TamedMonster } from 'src/app/database/tamedMonster/tamed-monster.type';
import { statIconDict } from 'src/app/core/config/statIconDict';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';
import { ProfessionName } from 'src/app/core/enum/profession-name.enum';
import { TraitName } from 'src/app/core/enum/trait.enum';

@Component({
    selector: 'app-stable',
    imports: [ModalLayoutComponent, XpRangeComponent],
    templateUrl: './stable.component.html',
    styleUrl: './stable.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StableComponent {
    tamedMonsterManager = inject(TamedMonsterManagerService);
    tamedMonsterList = toSignal(this.tamedMonsterManager.tamedMonsterList$);

    readonly selectedId = signal<string | undefined>(undefined);

    selectedMonster = computed(() =>
        this.tamedMonsterList()?.find(
            (tamedMonster) => tamedMonster.id === this.selectedId()
        )
    );
    statIconDict = statIconDict;

    select(monster: TamedMonster) {
        if (monster.id === this.selectedId()) {
            this.selectedId.set(undefined);
            return;
        }
        this.selectedId.set(monster.id);
    }

    getImage(name: string) {
        return this.tamedMonsterManager.getImageFromMonster(name);
    }
}
