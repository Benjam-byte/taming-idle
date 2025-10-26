import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { statIconDict, StatKey } from 'src/app/core/config/statIconDict';
import { XpRangeComponent } from '../profession/xp-range/xp-range.component';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { RoundToPipe } from '../../core/pipe/roundTo.pipe';
import { RelicManagerService } from 'src/app/core/service/player/relic-manager.service';
import { RelicSelectionComponent } from 'src/app/core/components/relic-selection/relic-selection.component';
import { TamedMonsterManagerService } from 'src/app/core/service/monster/tamed-monster-manager.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, Observable, ReplaySubject, switchMap } from 'rxjs';
import {
    MonsterProfession,
    TamedMonster,
} from 'src/app/database/tamedMonster/tamed-monster.type';
import { calculateMathFunction } from 'src/app/core/helpers/function/function';
import { ProfessionManagerService } from 'src/app/core/service/player/profession-manager.service';

@Component({
    selector: 'app-monster-stat',
    templateUrl: './monster-stat.page.html',
    styleUrls: ['./monster-stat.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        XpRangeComponent,
        ModalLayoutComponent,
        RoundToPipe,
    ],
})
export class MonsterStatPage {
    modalCtrl = inject(ModalController);
    relicManagerService = inject(RelicManagerService);
    tamedMonsterManager = inject(TamedMonsterManagerService);
    professionManager = inject(ProfessionManagerService);

    private readonly monsterId$ = new ReplaySubject<string>(1);

    @Input() set monsterId(value: string) {
        if (value) this.monsterId$.next(value);
    }

    readonly monster = toSignal(
        this.monsterId$.pipe(
            switchMap(
                (id) =>
                    this.tamedMonsterManager.getMonsterById$(
                        id
                    ) as Observable<TamedMonster | null>
            ),
            filter((m): m is TamedMonster => m != null)
        )
    );

    readonly statIconDict = statIconDict;

    readonly relic = computed(() => {
        const m = this.monster();
        return m ? this.relicManagerService.getRelicById(m.relicId) : null;
    });

    readonly damage = computed(() => {
        const m = this.monster();
        if (!m) return 0;
        return (
            m.damage +
            this.relicManagerService.getDamageFromRelicById(m.relicId)
        );
    });

    readonly image = computed(() => {
        const m = this.monster();
        return m
            ? this.tamedMonsterManager.getImageFromMonster(m.monsterSpecies)
                  .base
            : '';
    });

    readonly relicBonusImagePath = computed(() => {
        const stat = this.relic()?.effet.stat as StatKey | undefined;
        return stat
            ? this.statIconDict[stat]
            : this.statIconDict['lootNormalBonus'];
    });

    async select() {
        const relicList = this.relicManagerService.relicList.filter(
            (relic) => relic.quantity > 0
        );
        const modal = await this.modalCtrl.create({
            component: RelicSelectionComponent,
            cssClass: 'fit-modal',
            backdropDismiss: true,
            showBackdrop: false,
            componentProps: {
                relicList: relicList,
            },
        });

        modal.present();

        const { data } = await modal.onWillDismiss();
        if (data) {
            const monster = this.monster();
            if (!monster) throw new Error('not found');
            this.tamedMonsterManager
                .associateRelic$(monster.id, data.id)
                .subscribe();
        }
    }

    dissociate() {
        const monster = this.monster();
        if (!monster) throw new Error('not found');
        this.tamedMonsterManager.associateRelic$(monster.id, '').subscribe();
    }

    maxXp(monsterProfession: MonsterProfession) {
        const profession = this.professionManager.getProfessionByName(
            monsterProfession.name
        );
        return calculateMathFunction(
            profession.function,
            monsterProfession.level
        );
    }
}
