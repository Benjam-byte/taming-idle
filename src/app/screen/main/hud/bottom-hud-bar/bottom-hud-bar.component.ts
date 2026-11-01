import { Component, inject } from '@angular/core';
import { IconButtonComponent } from 'src/app/components/icon-button/icon-button.component';
import { ModalService } from 'src/app/core/service/modal-service';

@Component({
  selector: 'app-bottom-hud-bar',
  standalone: true,
  templateUrl: './bottom-hud-bar.component.html',
  imports: [IconButtonComponent],
})
export class BottomHudBarComponent {
  private readonly modalService = inject(ModalService);

  openMenu(): Promise<void> {
    return this.modalService.open('menu', () =>
      import('../../../modal/menu/menu.component').then(
        (m) => m.MenuComponent,
      ),
    );
  }
}
