import { Component, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';
import { ModalService } from 'src/app/core/service/modal-service';

@Component({
  selector: 'app-modal-layout',
  standalone: true,
  templateUrl: './modal-layout.component.html',
  styleUrls: ['./modal-layout.component.scss'],
  imports: [IconButtonComponent],
})
export class ModalLayoutComponent {
  private readonly modalCtrl = inject(ModalController);
  private readonly modalService = inject(ModalService);

  readonly title = input<string | null>(null);
  readonly showMenuButton = input(true);

  close(): Promise<boolean> {
    return this.modalCtrl.dismiss();
  }

  goToMenu(): Promise<void> {
    return this.modalService.replace('menu', () =>
      import('../menu/menu.component').then((m) => m.MenuComponent),
    );
  }
}
