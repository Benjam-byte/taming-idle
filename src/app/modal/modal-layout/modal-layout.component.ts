import { Component, inject, input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
@Component({
  selector: 'app-modal-layout',
  templateUrl: './modal-layout.component.html',
  styleUrls: ['./modal-layout.component.scss'],
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
