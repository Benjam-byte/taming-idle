import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  MONSTER_PORTRAIT,
  MONSTER_TYPE_ICON,
} from 'src/app/core/assets/monster-portraits';
import { AttackEffect, MonsterName } from 'src/app/core/models/monster';
import { generateCombatMonster } from 'src/app/core/service/combat/combat-monster';
import { MonsterStore } from 'src/app/core/service/monster/monster.store';
import { ACTIVE_TEAM_SIZE, TamedMonster } from 'src/app/database/type/monster';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

const SPECIAL_ATTACK_ICON: Record<AttackEffect, string> = {
  multiple: 'assets/icon/sword.png',
  boost: 'assets/icon/stat/damage.png',
  heal: 'assets/icon/stat/enchantedSoul.png',
  shield: 'assets/icon/helmet.png',
  stun: 'assets/icon/hourglass.png',
};

type ActiveSlot = {
  tamedId: string;
  name: MonsterName;
  portraitSrc: string;
  typeIconSrc: string;
} | null;

type CreatureStat = {
  label: string;
  value: number;
  iconSrc: string;
};

type CreatureAttack = {
  name: string;
  kind: string;
  power?: number;
  turnsRequired?: number;
  iconSrc: string;
  description: string;
};

type CreatureSheet = {
  name: MonsterName;
  imageSrc: string;
  combatStats: readonly CreatureStat[];
  attacks: readonly CreatureAttack[];
};

function toActiveSlot(tamedMonster: TamedMonster | null): ActiveSlot {
  if (!tamedMonster) {
    return null;
  }

  return {
    tamedId: tamedMonster.id,
    name: tamedMonster.monster.name,
    portraitSrc: MONSTER_PORTRAIT[tamedMonster.monster.name],
    typeIconSrc: MONSTER_TYPE_ICON[tamedMonster.monster.type],
  };
}

function toCreatureSheet(tamedMonster: TamedMonster): CreatureSheet {
  const combatMonster = generateCombatMonster(tamedMonster.monster);
  const { baseCharacteristics } = combatMonster.attribut;
  const base = combatMonster.attacks.base;
  const special = combatMonster.attacks.special;

  return {
    name: tamedMonster.monster.name,
    imageSrc: MONSTER_PORTRAIT[tamedMonster.monster.name],
    combatStats: [
      { label: 'HP', value: baseCharacteristics.hp, iconSrc: 'assets/icon/heart.png' },
      { label: 'Attaque', value: baseCharacteristics.attack, iconSrc: 'assets/icon/stat/damage.png' },
      { label: 'Defense', value: baseCharacteristics.defense, iconSrc: 'assets/icon/stat/defense.png' },
      { label: 'Vitesse', value: baseCharacteristics.speed, iconSrc: 'assets/icon/stat/fighting-speed.png' },
    ],
    attacks: [
      {
        name: base.name,
        kind: 'Attaque de base',
        power: base.effiency,
        iconSrc: 'assets/icon/sword.png',
        description: base.description,
      },
      {
        name: special.name,
        kind: 'Attaque speciale',
        power: 'effiency' in special ? special.effiency : undefined,
        turnsRequired: special.turn,
        iconSrc: SPECIAL_ATTACK_ICON[special.effect],
        description: special.description,
      },
    ],
  };
}

@Component({
  selector: 'app-active-team-modal',
  standalone: true,
  imports: [ModalLayoutComponent],
  templateUrl: './active-team.component.html',
  styleUrl: './active-team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveTeamModalComponent {
  private readonly monsterStore = inject(MonsterStore);

  readonly teamSize = ACTIVE_TEAM_SIZE;

  readonly activeSlots = computed(() =>
    this.monsterStore.activeTeam().map(toActiveSlot),
  );
  readonly activeCreatureCount = computed(
    () => this.activeSlots().filter((slot) => slot !== null).length,
  );

  readonly selectedSlotIndex = signal(0);
  readonly attacksExpanded = signal(true);

  readonly selectedSheet = computed<CreatureSheet | null>(() => {
    const tamedMonster = this.monsterStore.activeTeam()[this.selectedSlotIndex()];
    return tamedMonster ? toCreatureSheet(tamedMonster) : null;
  });

  readonly pickerSlotIndex = signal<number | null>(null);
  readonly isPickerOpen = computed(() => this.pickerSlotIndex() !== null);

  readonly pickerCandidates = computed(() => {
    const slotIndex = this.pickerSlotIndex();

    if (slotIndex === null) {
      return [];
    }

    const activeIdsInOtherSlots = new Set(
      this.monsterStore
        .activeTeam()
        .filter((tamedMonster, index) => tamedMonster && index !== slotIndex)
        .map((tamedMonster) => tamedMonster!.id),
    );

    return this.monsterStore
      .tamed()
      .filter((tamedMonster) => !activeIdsInOtherSlots.has(tamedMonster.id));
  });

  readonly pickerHasCurrentCreature = computed(() => {
    const slotIndex = this.pickerSlotIndex();
    return slotIndex !== null && this.activeSlots()[slotIndex] !== null;
  });

  selectSlot(index: number): void {
    this.selectedSlotIndex.set(index);

    if (this.activeSlots()[index]) {
      this.closePicker();
    } else {
      this.pickerSlotIndex.set(index);
    }
  }

  openPicker(index: number): void {
    this.selectedSlotIndex.set(index);
    this.pickerSlotIndex.set(index);
  }

  closePicker(): void {
    this.pickerSlotIndex.set(null);
  }

  pickCreature(tamedId: string): void {
    const slotIndex = this.pickerSlotIndex();

    if (slotIndex === null) {
      return;
    }

    this.monsterStore.setTeamSlot(slotIndex, tamedId);
    this.closePicker();
  }

  removeFromTeam(): void {
    const slotIndex = this.pickerSlotIndex();

    if (slotIndex === null) {
      return;
    }

    this.monsterStore.setTeamSlot(slotIndex, null);
    this.closePicker();
  }

  toggleAttacks(): void {
    this.attacksExpanded.update((isExpanded) => !isExpanded);
  }

  portraitSrcFor(tamedMonster: TamedMonster): string {
    return MONSTER_PORTRAIT[tamedMonster.monster.name];
  }

  trackStat(index: number, stat: CreatureStat): string {
    return stat.label;
  }

  trackAttack(index: number, attack: CreatureAttack): string {
    return attack.name;
  }
}
