import { Injectable, Type, computed, inject, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

export type ModalKey = 'menu' | 'map' | 'bestiary' | 'active-team';

type ComponentLoader = () => Promise<Type<unknown>>;

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly modalCtrl = inject(ModalController);
  private readonly opened = signal<ReadonlySet<ModalKey>>(new Set());

  readonly hasOpenModal = computed(() => this.opened().size > 0);

  isOpen(key: ModalKey): boolean {
    return this.opened().has(key);
  }

  open(
    key: ModalKey,
    loadComponent: ComponentLoader,
    componentProps?: Record<string, unknown>,
  ): Promise<void> {
    return this.show(key, loadComponent, componentProps, false);
  }

  replace(
    key: ModalKey,
    loadComponent: ComponentLoader,
    componentProps?: Record<string, unknown>,
  ): Promise<void> {
    return this.show(key, loadComponent, componentProps, true);
  }

  private async show(
    key: ModalKey,
    loadComponent: ComponentLoader,
    componentProps: Record<string, unknown> | undefined,
    replaceTop: boolean,
  ): Promise<void> {
    if (this.isOpen(key)) return;
    this.setOpen(key, true);

    try {
      if (replaceTop) {
        const top = await this.modalCtrl.getTop();
        await top?.dismiss();
      }

      const modal = await this.modalCtrl.create({
        component: await loadComponent(),
        componentProps,
        cssClass: 'full-screen-modal',
        backdropDismiss: true,
        showBackdrop: true,
      });

      modal.onDidDismiss().then(() => this.setOpen(key, false));
      await modal.present();
    } catch (err) {
      this.setOpen(key, false);
      throw err;
    }
  }

  private setOpen(key: ModalKey, open: boolean): void {
    this.opened.update((keys) => {
      const next = new Set(keys);
      if (open) next.add(key);
      else next.delete(key);
      return next;
    });
  }
}
