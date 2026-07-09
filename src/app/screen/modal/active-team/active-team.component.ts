import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

type TeamJob = {
  label: string;
  level: number;
  role: 'primary' | 'secondary';
  iconSrc: string;
};

type TeamStat = {
  label: string;
  value: number | string;
  iconSrc: string;
};

type TeamAttack = {
  name: string;
  kind: string;
  power: number;
  turnsRequired?: number;
  iconSrc: string;
  description: string;
};

type TeamCreature = {
  id: string;
  name: string;
  imageSrc: string;
  typeIconSrc: string;
  mana: {
    current: number;
    max: number;
  };
  jobs: readonly TeamJob[];
  combatStats: readonly TeamStat[];
  explorationStats: readonly TeamStat[];
  attacks: readonly TeamAttack[];
};

type TeamSlot =
  | {
      kind: 'creature';
      creature: TeamCreature;
    }
  | {
      kind: 'empty';
      id: string;
    };

const activeCreatures: readonly TeamCreature[] = [
  {
    id: 'terra-larva',
    name: 'Larve de Terre',
    imageSrc: 'assets/monster/terra_larva/Terra_larva.webp',
    typeIconSrc: 'assets/icon/earth.png',
    mana: {
      current: 126,
      max: 180,
    },
    jobs: [
      {
        label: 'Mineur',
        level: 6,
        role: 'primary',
        iconSrc: 'assets/icon/gems.png',
      },
      {
        label: 'Cueilleur',
        level: 3,
        role: 'secondary',
        iconSrc: 'assets/icon/footsteps.png',
      },
    ],
    combatStats: [
      {
        label: 'Initiative',
        value: 12,
        iconSrc: 'assets/icon/stat/fighting-speed.png',
      },
      {
        label: 'Defense',
        value: 18,
        iconSrc: 'assets/icon/stat/defense.png',
      },
      {
        label: 'Attaque',
        value: 14,
        iconSrc: 'assets/icon/stat/damage.png',
      },
      {
        label: 'HP',
        value: 92,
        iconSrc: 'assets/icon/heart.png',
      },
    ],
    explorationStats: [
      {
        label: 'Vitesse',
        value: 8,
        iconSrc: 'assets/icon/footsteps.png',
      },
      {
        label: 'Vision',
        value: 5,
        iconSrc: 'assets/icon/loupe.png',
      },
      {
        label: 'Perception',
        value: 11,
        iconSrc: 'assets/icon/information.png',
      },
      {
        label: 'Cout mana',
        value: 3,
        iconSrc: 'assets/icon/stat/soul.png',
      },
      {
        label: 'Recolte bouffe',
        value: '18%',
        iconSrc: 'assets/icon/stat/gathering.png',
      },
      {
        label: 'Recolte minerai',
        value: '34%',
        iconSrc: 'assets/icon/gems.png',
      },
    ],
    attacks: [
      {
        name: 'Morsure de Terre',
        kind: 'Attaque de base',
        power: 14,
        iconSrc: 'assets/icon/sword.png',
        description:
          'Une attaque simple qui inflige des degats physiques a la cible.',
      },
      {
        name: 'Secousse Souterraine',
        kind: 'Attaque speciale',
        power: 32,
        turnsRequired: 4,
        iconSrc: 'assets/icon/stat/damage.png',
        description:
          'Frappe le sol et inflige de lourds degats aux ennemis proches.',
      },
    ],
  },
  {
    id: 'slime-moss',
    name: 'Slime Mousseux',
    imageSrc: 'assets/monster/slime/Slime_Base.webp',
    typeIconSrc: 'assets/icon/stat/forest.png',
    mana: {
      current: 74,
      max: 120,
    },
    jobs: [
      {
        label: 'Gardien',
        level: 4,
        role: 'primary',
        iconSrc: 'assets/icon/helmet.png',
      },
      {
        label: 'Alchimiste',
        level: 2,
        role: 'secondary',
        iconSrc: 'assets/icon/stat/soul.png',
      },
    ],
    combatStats: [
      {
        label: 'Initiative',
        value: 9,
        iconSrc: 'assets/icon/stat/fighting-speed.png',
      },
      {
        label: 'Defense',
        value: 12,
        iconSrc: 'assets/icon/stat/defense.png',
      },
      {
        label: 'Attaque',
        value: 10,
        iconSrc: 'assets/icon/stat/damage.png',
      },
      {
        label: 'HP',
        value: 68,
        iconSrc: 'assets/icon/heart.png',
      },
    ],
    explorationStats: [
      {
        label: 'Vitesse',
        value: 6,
        iconSrc: 'assets/icon/footsteps.png',
      },
      {
        label: 'Vision',
        value: 7,
        iconSrc: 'assets/icon/loupe.png',
      },
      {
        label: 'Perception',
        value: 14,
        iconSrc: 'assets/icon/information.png',
      },
      {
        label: 'Cout mana',
        value: 2,
        iconSrc: 'assets/icon/stat/soul.png',
      },
      {
        label: 'Recolte bouffe',
        value: '26%',
        iconSrc: 'assets/icon/stat/gathering.png',
      },
      {
        label: 'Recolte minerai',
        value: '12%',
        iconSrc: 'assets/icon/gems.png',
      },
    ],
    attacks: [
      {
        name: 'Baffe Gluante',
        kind: 'Attaque de base',
        power: 10,
        iconSrc: 'assets/icon/sword.png',
        description:
          'Projette une masse souple qui ralentit legerement la cible.',
      },
      {
        name: 'Regeneration',
        kind: 'Attaque speciale',
        power: 18,
        turnsRequired: 3,
        iconSrc: 'assets/icon/stat/enchantedSoul.png',
        description:
          'Charge une reserve vitale avant de rendre des points de vie.',
      },
    ],
  },
];

const teamSlots: readonly TeamSlot[] = [
  {
    kind: 'creature',
    creature: activeCreatures[0],
  },
  {
    kind: 'creature',
    creature: activeCreatures[1],
  },
  {
    kind: 'empty',
    id: 'empty-slot',
  },
];

@Component({
  selector: 'app-active-team-modal',
  standalone: true,
  imports: [ModalLayoutComponent],
  templateUrl: './active-team.component.html',
  styleUrl: './active-team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveTeamModalComponent {
  readonly slots = teamSlots;
  readonly activeCreatureCount = activeCreatures.length;
  readonly selectedCreatureId = signal(activeCreatures[0].id);
  readonly attacksExpanded = signal(true);

  readonly selectedCreature = computed(
    () =>
      activeCreatures.find(
        (creature) => creature.id === this.selectedCreatureId(),
      ) ?? activeCreatures[0],
  );

  readonly selectedManaPercent = computed(() => {
    const mana = this.selectedCreature().mana;

    if (mana.max <= 0) {
      return 0;
    }

    return Math.min(100, Math.max(0, (mana.current / mana.max) * 100));
  });

  selectCreature(creatureId: string): void {
    this.selectedCreatureId.set(creatureId);
  }

  toggleAttacks(): void {
    this.attacksExpanded.update((isExpanded) => !isExpanded);
  }

  trackSlot(index: number, slot: TeamSlot): string {
    return slot.kind === 'creature' ? slot.creature.id : slot.id;
  }

  trackStat(index: number, stat: TeamStat): string {
    return stat.label;
  }

  trackAttack(index: number, attack: TeamAttack): string {
    return attack.name;
  }
}
