import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';

@Component({
  selector: 'app-bottom-hud-bar',
  standalone: true,
  templateUrl: './bottom-hud-bar.component.html',
  imports: [IconButtonComponent],
})
export class BottomHudBarComponent {
  private readonly modalCtrl = inject(ModalController);

  async openMenu(): Promise<void> {
    const { MenuComponent } = await import(
      '../../../modal/menu/menu.component'
    );

    const modal = await this.modalCtrl.create({
      component: MenuComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();
  }
}
