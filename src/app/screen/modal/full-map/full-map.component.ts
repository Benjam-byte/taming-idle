import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  ViewChild,
} from '@angular/core';
import { Application, Container } from 'pixi.js';
import { MapStore } from 'src/app/core/service/map/map.store';
import { FullMapRenderer } from './full-map-renderer';
import { ModalLayoutComponent } from '../modal-layout/modal-layout.component';

@Component({
  selector: 'app-full-map',
  standalone: true,
  templateUrl: './full-map.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalLayoutComponent],
})
export class FullMapComponent {
  @ViewChild('fullMapContainer', { static: true })
  private readonly fullMapContainer!: ElementRef<HTMLDivElement>;

  private readonly mapService = inject(MapStore);

  private readonly game = new Application();
  private readonly worldContainer = new Container();

  private renderer?: FullMapRenderer;
  private resizeObserver?: ResizeObserver;

  async ngAfterViewInit(): Promise<void> {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );

    const element = this.fullMapContainer.nativeElement;
    const rect = element.getBoundingClientRect();

    await this.game.init({
      width: rect.width,
      height: rect.height,
      resizeTo: element,
      backgroundAlpha: 0,
      antialias: false,
    });

    element.appendChild(this.game.canvas);
    this.game.stage.addChild(this.worldContainer);

    this.renderer = new FullMapRenderer(
      this.game,
      this.worldContainer,
      this.mapService,
    );

    this.renderer.init();

    requestAnimationFrame(() => {
      const nextRect = element.getBoundingClientRect();
      this.game.renderer.resize(nextRect.width, nextRect.height);
      this.renderer?.render();
      this.renderer?.centerOnPlayer();
    });

    this.resizeObserver = new ResizeObserver(() => {
      const nextRect = element.getBoundingClientRect();
      this.game.renderer.resize(nextRect.width, nextRect.height);
      this.renderer?.render();
      this.renderer?.centerOnPlayer();
    });

    this.resizeObserver.observe(element);
  }
  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;

    this.renderer?.destroy();
    this.renderer = undefined;

    if (this.worldContainer.parent) {
      this.worldContainer.parent.removeChild(this.worldContainer);
    }

    this.worldContainer.destroy({
      children: false,
    });

    this.game.canvas?.remove();

    this.game.destroy(false);
  }
}
