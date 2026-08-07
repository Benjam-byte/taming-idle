import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MonsterName } from 'src/app/core/models/monster';
import { generateCombatMonster } from 'src/app/core/service/combat/combat-monster';
import { MonsterStore } from 'src/app/core/service/monster/monster.store';
import { TamedMonster } from 'src/app/database/type/monster';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

const MONSTER_PORTRAIT: Record<MonsterName, string> = {
  'Terra larva': 'assets/monster/terra_larva/Terra_larva.webp',
  Slime: 'assets/monster/slime/Slime_Base.webp',
};

type BestiaryEntry = {
  id: string;
  name: MonsterName;
  portraitSrc: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
};

function toBestiaryEntry(tamedMonster: TamedMonster): BestiaryEntry {
  const { baseCharacteristics } = generateCombatMonster(
    tamedMonster.monster,
  ).attribut;

  return {
    id: tamedMonster.id,
    name: tamedMonster.monster.name,
    portraitSrc: MONSTER_PORTRAIT[tamedMonster.monster.name],
    hp: baseCharacteristics.hp,
    attack: baseCharacteristics.attack,
    defense: baseCharacteristics.defense,
    speed: baseCharacteristics.speed,
  };
}

@Component({
  selector: 'app-bestiary-modal',
  standalone: true,
  imports: [ModalLayoutComponent],
  templateUrl: './bestiary.component.html',
  styleUrl: './bestiary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestiaryModalComponent {
  private readonly monsterStore = inject(MonsterStore);

  readonly tamedCount = this.monsterStore.tamedCount;
  readonly entries = computed(() =>
    this.monsterStore.tamed().map(toBestiaryEntry),
  );

  trackEntry(index: number, entry: BestiaryEntry): string {
    return entry.id;
  }
}
