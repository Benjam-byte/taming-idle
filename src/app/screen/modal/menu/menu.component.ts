import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ModalService } from 'src/app/core/service/modal-service';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';
import { MenuButtonComponent } from './menu-button/menu-button.component';

type MenuItem = {
  label: string;
  iconSrc: string;
  disabled?: boolean;
};

type MenuSection = {
  title: string;
  items: readonly MenuItem[];
};

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [ModalLayoutComponent, MenuButtonComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  private readonly modalService = inject(ModalService);

  readonly sections: readonly MenuSection[] = [
    {
      title: 'Lieux',
      items: [
        { label: 'Tour', iconSrc: 'assets/icon/tower.png' },
        { label: 'Olympus', iconSrc: 'assets/icon/hands.png' },
        { label: 'Meta god', iconSrc: 'assets/icon/metagod.png' },
        { label: 'Gisement', iconSrc: 'assets/icon/gems.png' },
        { label: 'Carte', iconSrc: 'assets/icon/pin.png' },
      ],
    },
    {
      title: 'Joueur',
      items: [
        { label: 'Profil', iconSrc: 'assets/icon/equipe.png' },
        { label: 'Region', iconSrc: 'assets/icon/world-level.png' },
        { label: 'Metier', iconSrc: 'assets/icon/skilltree.png' },
        { label: 'Reliques', iconSrc: 'assets/icon/relic.png' },
        { label: 'Sauvegarde', iconSrc: 'assets/icon/save.png' },
      ],
    },
    {
      title: 'Monstres',
      items: [
        { label: 'Bestiaire', iconSrc: 'assets/icon/bestiary.png' },
        { label: 'Incubateur', iconSrc: 'assets/icon/creature.png' },
        { label: 'Stable', iconSrc: 'assets/icon/stable.png' },
      ],
    },
  ];

  async selectItem(item: MenuItem): Promise<void> {
    if (item.label === 'Profil') {
      await this.openActiveTeamModal();
      return;
    }

    if (item.label === 'Bestiaire') {
      await this.openBestiaryModal();
      return;
    }

    console.log(`Menu placeholder selected: ${item.label}`);
  }

  private openActiveTeamModal(): Promise<void> {
    return this.modalService.replace('active-team', () =>
      import('../active-team/active-team.component').then(
        (m) => m.ActiveTeamModalComponent,
      ),
    );
  }

  private openBestiaryModal(): Promise<void> {
    return this.modalService.replace('bestiary', () =>
      import('../bestiary/bestiary.component').then(
        (m) => m.BestiaryModalComponent,
      ),
    );
  }
}
