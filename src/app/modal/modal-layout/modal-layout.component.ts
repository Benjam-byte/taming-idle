import { Component, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IconButtonComponent } from 'src/app/ui/icon-button/icon-button.component';

@Component({
  selector: 'app-modal-layout',
  standalone: true,
  templateUrl: './modal-layout.component.html',
  styleUrls: ['./modal-layout.component.scss'],
  imports: [IconButtonComponent],
})
export class ModalLayoutComponent {
  private readonly modalCtrl = inject(ModalController);

  readonly title = input<string | null>(null);
  readonly showMenuButton = input(true);

  close(): void {
    this.modalCtrl.dismiss();
  }

  async goToMenu(): Promise<void> {
    /**   await this.close();

    const { MenuComponent } = await import('../menu/menu.component');

    const modal = await this.modalCtrl.create({
      component: MenuComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();*/
  }
}
